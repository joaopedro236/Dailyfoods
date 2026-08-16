
from ...Database.Config.connectDatabaseUser import connect_database_user
from fastapi import APIRouter, Response
from ...Validation.LoginUser import LoginUser
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

router = APIRouter()
ph = PasswordHasher()
@router.post("/api/loginUser")
def login_user(data: LoginUser, response: Response):
    conn = None
    cursor = None
    try:
        conn, cursor = connect_database_user()
        cursor.execute(
            "SELECT password, session_token FROM users_Dailyfoods WHERE CNPJ = %s",
            (data.CNPJ,),
        )
        User = cursor.fetchone()
        if not User:
            return {"Status": False}
        try:
            ph.verify(User[0], data.password)
        except VerifyMismatchError:
            return {"Status": False}
        response.set_cookie(
            key="user_session_token",
            value=User[1],
            httponly=True,
            max_age=60 * 60 * 24 * 7,
            samesite="lax",
            secure=False,
            path="/",
        )
        return {"Status": True, "token": User[1]}

    except Exception :
        return {"Error": 'Error', "Status": False}
