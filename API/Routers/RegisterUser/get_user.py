
from ...Database.Config.connectDatabaseUser import connect_database_user
from fastapi import APIRouter, Cookie

router = APIRouter()
@router.get("/api/user")
def get_user(
    user_session_token: str = Cookie(default=None),
    session_token: str = Cookie(default=None),
):
    token = user_session_token or session_token
    if token is None:
        return {"Status": False}

    try:
        conn, cursor = connect_database_user()
        cursor.execute(
            "SELECT name_user, email, money,purchasedOrders FROM users_Dailyfoods WHERE session_token = %s",
            (token,),
        )
        userData = cursor.fetchone()

        if userData:
            return {"Status": True, "name": userData[0], "email": userData[1], "money": userData[2], "purchasedOrders": userData[3]}
        return {"Status": False}
    except Exception as e:
        return {"Status": False, "Error": 'Error'}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
