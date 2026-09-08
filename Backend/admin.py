from typing import Literal

from fastapi import Depends, HTTPException, Path, Query
from pydantic import BaseModel, Field

from auth import require_roles
from database import get_db_connection

AdminUser = Depends(require_roles("ADMIN"))

class BuyerRegistrationReview(BaseModel):
    status: Literal["APPROVED", "REJECTED", "CONTACTED"]
    review_notes: str | None = Field(default=None, max_length=1000)


REVIEWABLE_STATUSES = {"PENDING", "CONTACTED"}

def list_buyer_registration_requests(
    status: Literal["PENDING", "APPROVED", "REJECTED", "CONTACTED"] | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100),
    user=AdminUser,
):
    conditions = []
    params: list[object] = []
    
    if status:
        conditions.append("status = %s")
        params.append(status)
        
    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(f"SELECT COUNT(*) FROM buyer_registration_requests {where_clause}", tuple(params))
            total = cursor.fetchone()[0]
            
            offset = (page - 1) * page_size
            query = f"""
                SELECT id, full_name, business_name, buyer_type, mobile_number, email, 
                       state, district, market_area, business_address, preferred_crops, 
                       min_quantity, max_quantity, quantity_unit, min_price, max_price, 
                       buying_frequency, status, reviewed_by, reviewed_at, review_notes, 
                       created_at, updated_at
                FROM buyer_registration_requests
                {where_clause}
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(query, (*params, page_size, offset))
            
            columns = [desc[0] for desc in cursor.description]
            requests = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
    for req in requests:
        if req["reviewed_at"]:
            req["reviewed_at"] = req["reviewed_at"].isoformat()
        if req["created_at"]:
            req["created_at"] = req["created_at"].isoformat()
        if req["updated_at"]:
            req["updated_at"] = req["updated_at"].isoformat()
        
        req["min_quantity"] = float(req["min_quantity"])
        req["max_quantity"] = float(req["max_quantity"])
        req["min_price"] = float(req["min_price"])
        req["max_price"] = float(req["max_price"])

    return {
        "items": requests,
        "page": page,
        "page_size": page_size,
        "total": total,
        "has_next": offset + len(requests) < total
    }

def review_buyer_registration_request(
    payload: BuyerRegistrationReview,
    request_id: int = Path(ge=1),
    user=AdminUser,
):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT status FROM buyer_registration_requests WHERE id = %s",
                (request_id,)
            )
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Request not found")
            if row[0] not in REVIEWABLE_STATUSES:
                raise HTTPException(
                    status_code=409,
                    detail="This buyer registration request has already been finalized",
                )
                
            cursor.execute(
                """
                UPDATE buyer_registration_requests 
                SET status = %s, review_notes = %s, reviewed_by = %s, reviewed_at = NOW(), updated_at = NOW()
                WHERE id = %s
                RETURNING id, status, reviewed_at, review_notes
                """,
                (payload.status, payload.review_notes, user["id"], request_id)
            )
            updated_row = cursor.fetchone()

        connection.commit()
        
    return {
        "id": updated_row[0],
        "status": updated_row[1],
        "reviewed_at": updated_row[2].isoformat(),
        "review_notes": updated_row[3]
    }
