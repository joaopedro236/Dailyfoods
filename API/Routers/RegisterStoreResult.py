import requests
from ..Database.Config.connectDatabaseRestaurantConfig import connect_database
from fastapi import APIRouter
from ..Validation.RegisterStore import Store
router = APIRouter()


@router.post("/api/registerStore")
def register_store(data: Store):
    conn = None
    cursor = None
    try:
        conn, cursor = connect_database()
      
        command_sql = """ INSERT INTO restaurantConfig(name,cnpj,cep)
                        VALUES (%s, %s, %s)"""
        response = requests.post(
            "http://localhost:8000/api/registerStoreVerification",
            json={"name": data.name, "CNPJ": data.CNPJ, "CEP": data.CEP},
        )
        dataResponse = response.json()

        cnpj_exist = dataResponse["cnpjExist"]
        if not cnpj_exist :
            cursor.execute(command_sql, (data.name, data.CNPJ, data.CEP))
            conn.commit()
            return {"Status": True}
        return {"Status": False}
    except Exception as e:
        if conn:
            conn.rollback()
        return {"Error": str(e)}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()