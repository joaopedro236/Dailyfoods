from fastapi import APIRouter, Form, Depends
from pydantic import BaseModel, Field, field_validator
from ..Database.Config.connectDatabaseRestaurantConfig import connect_database

router = APIRouter()


class Store(BaseModel):
    name: str
    CNPJ: str
    CEP: str
    invoicing: int = Field(default=0)
    invoicing_history: list[float] = Field(default_factory=lambda: [0.0] * 7)
    orders: int = Field(default=0)
    completed: int = Field(default=0)
    progress: int = Field(default=0)
    image: str = ''

    @field_validator("CNPJ", check_fields=False)
    @classmethod
    def validationCNPJ(cls, value):
        value = value.replace(".", "").replace("-", "").replace("/", "")
        if len(value) != 14:
            raise ValueError("Error: The CNPJ must have 14 digits.  ")
        if not value.isdigit():
            raise ValueError("INVALID CNPJ")
        return value
    @classmethod
    def as_form(
        cls,
        name: str = Form(...),
        CNPJ: str = Form(...),
        CEP: str = Form(...),
        invoicing: int = Form(default=0),
        orders: int = Form(default=0),
        completed: int = Form(default=0),
        progress: int = Form(default=0)
    ):
        return cls(
            name=name,
            CNPJ=CNPJ,
            CEP=CEP,
            invoicing=invoicing,
            orders=orders,
            completed=completed,
            progress=progress
        )

@router.post("/api/registerStoreVerification")
def register_store(data: Store = Depends(Store.as_form)):
    conn = None
    cursor = None
    try:
        conn, cursor = connect_database()
        
        commandSql = "SELECT * FROM restaurantConfig WHERE CNPJ = %s"
        cursor.execute(commandSql, (data.CNPJ,))
        result = cursor.fetchone()
        
        cnpj_exists = result is not None
        
        return {"cnpj": data.CNPJ, "cnpjExist": cnpj_exists}

    except Exception as e:
        return {"cnpj": "", "cnpjExist": False, "error": str(e)}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
