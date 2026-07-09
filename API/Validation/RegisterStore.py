from fastapi import APIRouter
from pydantic import BaseModel, field_validator
from ..Database.Config.connectDatabaseRestaurantConfig import connect_database
router = APIRouter()
class Store(BaseModel):
    name:str
    CNPJ:str
    CEP: str
    
    @field_validator('CNPJ', check_fields=False)
    @classmethod
    def validationCNPJ(cls, value):
        value = value.replace(".", "").replace("-", "").replace("/", "")
        if len(value) != 14:
            raise ValueError("Error: The CNPJ must have 14 digits.  ")
        if not value.isdigit():
            raise ValueError("INVALID CNPJ")
        return value    
    
@router.post("/api/registerStoreVerification")
def register_store(data: Store):
    conn = None
    cursor = None
    try:
        conn,cursor = connect_database()
        commandSql = '''
            SELECT * FROM restaurantConfig WHERE CNPJ = %s'''
        cursor.execute(commandSql, (
            data.CNPJ,
        ))
        result = cursor.fetchone()
        if(result):
            return {
                'cnpj': data.CNPJ,
                'cnpjExist':True
            }
        else:
            return {
                'cnpj': data.CNPJ,
                'cnpjExist':False   
            }
           
    except Exception as e:
        raise Exception(f'Error: {e}')
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()