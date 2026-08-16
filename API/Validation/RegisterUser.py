from fastapi import APIRouter
from pydantic import BaseModel, field_validator, EmailStr
from ..Database.Config.connectDatabaseUser import connect_database_user

router = APIRouter()


class User(BaseModel):
    email: EmailStr
    name: str
    CNPJ: str
    CEP: str
    password: str

    @field_validator("CNPJ")
    @classmethod
    def validationCNPJ(cls, value):
        value = value.replace(".", "").replace("-", "").replace("/", "")
        if len(value) != 14:
            raise ValueError("Error: The CNPJ must have 14 digits.  ")
        if not value.isdigit():
            raise ValueError("INVALID CNPJ")
        return value


@router.post("/api/registerUserVerification")
def register_user_validation(data: User):
    conn = None
    cursor = None
    try:
        conn, cursor = connect_database_user()
        commandSql = """
               SELECT
EXISTS(SELECT 1 FROM users_Dailyfoods WHERE TRIM(CNPJ) = %s),
EXISTS(SELECT 1 FROM users_Dailyfoods WHERE LOWER(TRIM(email)) = %s)
"""
        cursor.execute(commandSql, (data.CNPJ.strip(), data.email.strip().lower()))
        result, resultEmail = cursor.fetchone()
        
        return {"CNPJExist": bool(result), "emailExists": bool(resultEmail)}

    except Exception :
        raise 'Error'
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
