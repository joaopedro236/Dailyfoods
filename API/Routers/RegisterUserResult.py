import requests
from ..Database.Config.connectDatabaseUser import connect_database
from fastapi import APIRouter
from ..Validation.RegisterUser import Store
router = APIRouter()


@router.post("/api/registerUser")
def register_user(data: Store):
    conn = None
    cursor = None
    try:
      
        command_sql = """ INSERT INTO users_Dailyfoods(name_user,CNPJ,CEP,email)
                        VALUES (%s, %s, %s, %s)"""
        response = requests.post(
            "http://localhost:8000/api/registerUserVerification",
            json=data.model_dump()
        )
        dataResponse = response.json()

        cnpj_exist = dataResponse["CNPJExist"]
        email_exist = dataResponse["emailExists"]

        if not cnpj_exist and not email_exist:
            conn, cursor = connect_database()
            cursor.execute(command_sql, (data.name, data.CNPJ, data.CEP, data.email))
            conn.commit()
            return {"StatusCnpj": False, "StatusEmail": False}
        elif cnpj_exist and not email_exist:
            return {"StatusCnpj": True, "StatusEmail": False}
        elif not cnpj_exist and email_exist:
            return {"StatusCnpj": False, "StatusEmail": True}
        else:
            return {"StatusCnpj": True, "StatusEmail": True}
    except Exception as e:
        if conn:
            conn.rollback()
        return {"Error": str(e)}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()