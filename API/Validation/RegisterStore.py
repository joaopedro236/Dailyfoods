from fastapi import APIRouter, Form, Depends
from pydantic import BaseModel, Field, field_validator
from ..Database.Config.connectDatabaseRestaurantConfig import connect_database
router = APIRouter()


class Orders(BaseModel):
    orderImage: list[str] = Field(default_factory=list)
    orderName: str = Field(min_length=5, max_length=200)
    orderPrice: float = Field(default=0.0)
    orderDescription: str = Field(min_length=10, max_length=500)
    orderState: bool = Field(default=True)
    orderComments: list[str] = Field(default_factory=list)
    @classmethod
    def as_form_orders(
        cls,
        orderImage: str = Form(...),
        orderName: str = Form(...),
        orderDescription: str = Form(...),
        orderPrice: float = Form(0.0),
        orderState: bool = Form(True),
        orderComments:str =Form(...)
    ):
        return cls(
            orderImage=[orderImage],
            orderName=orderName,
            orderDescription=orderDescription,
            orderPrice=orderPrice,
            orderState=orderState,
            orderComments=[orderComments]
        )
    

class Store(BaseModel):
    name: str = Field(min_length=5, max_length=200)
    CNPJ: str
    CEP: str
    invoicing: float = Field(default=0.0)
    invoicing_history: list[float] = Field(default_factory=lambda: [0.0] * 7)
    orders: int = Field(default=0)
    completed: int = Field(default=0)
    progress: int = Field(default=0)
    image: str = Field(default="")
    password: str
    restauranttag: list[str] = Field(default_factory=list)
    @field_validator("CNPJ")
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
        invoicing: float = Form(0.0),
        orders: int = Form(0),
        completed: int = Form(0),
        progress: int = Form(0),
        password: str = Form(...),
        restauranttag: str = Form(...),
    ):
        return cls(
            name=name,
            CNPJ=CNPJ,
            CEP=CEP,
            invoicing=float(invoicing),
            orders=int(orders),
            completed=int(completed),
            progress=int(progress),
            password=password,

            restauranttag=[restauranttag]
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
        return {"cnpj": "", "cnpjExist": False, "error":'Error'}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
