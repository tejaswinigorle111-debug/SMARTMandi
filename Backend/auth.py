import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, Request, status

from database import get_db_connection


SESSION_TTL = timedelta(days=7)
SCRYPT_N = 2**14
SCRYPT_R = 8
SCRYPT_P = 1

ALLOWED_ROLES = {
    "FARMER",
    "FPO",
    "BUYER",
    "WAREHOUSE_MANAGER",
    "TRANSPORT_PROVIDER",
    "ADMIN",
}


def _encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("ascii").rstrip("=")


def _decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt,
        n=SCRYPT_N,
        r=SCRYPT_R,
        p=SCRYPT_P,
    )
    return f"scrypt${SCRYPT_N}${SCRYPT_R}${SCRYPT_P}${_encode(salt)}${_encode(digest)}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        algorithm, n, r, p, encoded_salt, encoded_digest = encoded.split("$")
        if algorithm != "scrypt":
            return False
        digest = hashlib.scrypt(
            password.encode("utf-8"),
            salt=_decode(encoded_salt),
            n=int(n),
            r=int(r),
            p=int(p),
        )
        return hmac.compare_digest(digest, _decode(encoded_digest))
    except (ValueError, TypeError):
        return False


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _normalise_email(email: str | None) -> str | None:
    value = email.strip().lower() if email else None
    return value or None


def _normalise_phone(phone: str | None) -> str | None:
    value = phone.strip() if phone else None
    return value or None


def validate_role(role: str) -> str:
    normalised = role.strip().upper()
    if normalised not in ALLOWED_ROLES:
        raise HTTPException(status_code=400, detail="Unsupported role")
    return normalised


def register_user(
    *,
    email: str | None,
    phone: str | None,
    password: str,
    full_name: str,
    role: str,
):
    email = _normalise_email(email)
    phone = _normalise_phone(phone)
    role = validate_role(role)

    if role not in {"FARMER", "FPO", "BUYER"}:
        raise HTTPException(
            status_code=403,
            detail="This role must be assigned by an administrator",
        )

    if not email and not phone:
        raise HTTPException(status_code=400, detail="Email or phone is required")
    if len(password) < 10:
        raise HTTPException(status_code=400, detail="Password must contain at least 10 characters")
    if not full_name.strip():
        raise HTTPException(status_code=400, detail="Full name is required")

    password_hash = hash_password(password)
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO users (email, phone, password_hash, full_name)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id, email, phone, full_name, is_active, is_verified
                    """,
                    (email, phone, password_hash, full_name.strip()),
                )
                user = cursor.fetchone()
                cursor.execute(
                    """
                    INSERT INTO roles (name) VALUES (%s)
                    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                    RETURNING id
                    """,
                    (role,),
                )
                role_id = cursor.fetchone()[0]
                cursor.execute(
                    "INSERT INTO user_roles (user_id, role_id) VALUES (%s, %s)",
                    (user[0], role_id),
                )
                if role in {"FARMER", "FPO"}:
                    cursor.execute(
                        "INSERT INTO farmers (user_id) VALUES (%s) ON CONFLICT (user_id) DO NOTHING",
                        (user[0],),
                    )
                elif role == "BUYER":
                    cursor.execute(
                        "INSERT INTO buyers (user_id) VALUES (%s) ON CONFLICT (user_id) DO NOTHING",
                        (user[0],),
                    )
            connection.commit()
            return {"id": str(user[0]), "email": user[1], "phone": user[2], "full_name": user[3], "roles": [role]}
    except Exception as error:
        if getattr(error, "pgcode", None) == "23505":
            raise HTTPException(status_code=409, detail="An account with that email or phone already exists") from error
        raise


def authenticate_user(identifier: str, password: str):
    identifier = identifier.strip()
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, email, phone, password_hash, full_name, is_active, is_verified
                FROM users WHERE lower(email) = lower(%s) OR phone = %s
                """,
                (identifier, identifier),
            )
            user = cursor.fetchone()
            if not user or not user[3] or not verify_password(password, user[3]):
                raise HTTPException(status_code=401, detail="Invalid credentials")
            if not user[5]:
                raise HTTPException(status_code=403, detail="Account is inactive")
            cursor.execute(
                """
                SELECT roles.name FROM roles
                JOIN user_roles ON user_roles.role_id = roles.id
                WHERE user_roles.user_id = %s ORDER BY roles.name
                """,
                (user[0],),
            )
            roles = [row[0] for row in cursor.fetchall()]
            return {"id": str(user[0]), "email": user[1], "phone": user[2], "full_name": user[4], "roles": roles}


def create_session(user_id: str) -> tuple[str, datetime]:
    token = _encode(secrets.token_bytes(32))
    expires_at = _utc_now() + SESSION_TTL
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO auth_sessions (user_id, token_hash, expires_at) VALUES (%s, %s, %s)",
                (user_id, _token_hash(token), expires_at),
            )
        connection.commit()
    return token, expires_at


def assign_role(user_id: str, role: str) -> None:
    role = validate_role(role)
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO roles (name) VALUES (%s) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id",
                (role,),
            )
            role_id = cursor.fetchone()[0]
            cursor.execute(
                "INSERT INTO user_roles (user_id, role_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                (user_id, role_id),
            )
        connection.commit()


def revoke_session(token: str) -> None:
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE auth_sessions SET revoked_at = NOW() WHERE token_hash = %s AND revoked_at IS NULL",
                (_token_hash(token),),
            )
        connection.commit()


def get_current_user(request: Request):
    authorization = request.headers.get("Authorization", "")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    token = authorization[7:].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")

    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT users.id, users.email, users.phone, users.full_name, users.is_active,
                       auth_sessions.expires_at
                FROM auth_sessions JOIN users ON users.id = auth_sessions.user_id
                WHERE auth_sessions.token_hash = %s
                  AND auth_sessions.revoked_at IS NULL
                """,
                (_token_hash(token),),
            )
            session = cursor.fetchone()
            if not session or not session[4] or session[5] <= _utc_now():
                raise HTTPException(status_code=401, detail="Session expired or invalid")
            cursor.execute(
                """
                SELECT roles.name FROM roles
                JOIN user_roles ON user_roles.role_id = roles.id
                WHERE user_roles.user_id = %s ORDER BY roles.name
                """,
                (session[0],),
            )
            roles = [row[0] for row in cursor.fetchall()]
            cursor.execute("UPDATE auth_sessions SET last_used_at = NOW() WHERE token_hash = %s", (_token_hash(token),))
        connection.commit()

    return {
        "id": str(session[0]),
        "email": session[1],
        "phone": session[2],
        "full_name": session[3],
        "roles": roles,
    }


def require_roles(*allowed_roles: str):
    expected = {validate_role(role) for role in allowed_roles}

    def dependency(user=Depends(get_current_user)):
        if not expected.intersection(user["roles"]):
            raise HTTPException(status_code=403, detail="You are not authorized for this resource")
        return user

    return dependency


def extract_token(request: Request) -> str:
    authorization = request.headers.get("Authorization", "")
    return authorization[7:].strip() if authorization.startswith("Bearer ") else ""
