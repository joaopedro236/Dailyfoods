from fastapi import APIRouter
from pydantic import BaseModel, field_validator, EmailStr
from ..Database.Config.connectDatabaseUser import connect_database
router = APIRouter()
class Store(BaseModel):
    email:EmailStr
    name:str
    CNPJ:str
    CEP: str
    password:str
    @field_validator('CNPJ')
    @classmethod
    def validationCNPJ(cls, value):
        value = value.replace(".", "").replace("-", "").replace("/", "")
        if len(value) != 14:
            raise ValueError("Error: The CNPJ must have 14 digits.  ")
        if not value.isdigit():
            raise ValueError("INVALID CNPJ")
        return value    
    
@router.post("/api/registerUserVerification")
def register_user_validation(data: Store):
    conn = None
    cursor = None
    try:
        conn,cursor = connect_database()
        commandSql = '''
            SELECT 
            EXISTS(SELECT 1 FROM users_Dailyfoods WHERE CNPJ = %s),
            EXISTS(SELECT 1 FROM users_Dailyfoods WHERE email = %s)'''
        cursor.execute(commandSql, (
            data.CNPJ,
            data.email
        ))
        result,resultEmail = cursor.fetchone()
        return{
            'CNPJExist': result,
            'emailExists': resultEmail
        }

    except Exception as e:
        raise Exception(f'Error: {e}')
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()