import sys
import os
from dotenv import load_dotenv

# Ensure we can import from database and auth
sys.path.append(os.path.dirname(__file__))

from database import get_db_connection
from auth import assign_role

def make_admin(email: str):
    print(f"Looking up user with email: {email}")
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()
            if not user:
                print(f"Error: No user found with email '{email}'.")
                print("Please register on the frontend first.")
                sys.exit(1)
            
            user_id = user[0]
            print(f"Found user ID: {user_id}")
            
    try:
        assign_role(user_id, "ADMIN")
        print(f"Success! '{email}' is now an ADMIN.")
    except Exception as e:
        print(f"Failed to assign role: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python make_admin.py <user_email>")
        sys.exit(1)
        
    make_admin(sys.argv[1].strip())
