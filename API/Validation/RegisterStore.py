from fastapi import APIRouter, Form, Depends
from pydantic import BaseModel, Field, field_validator, model_validator
import requests
import urllib3
from ..Database.Config.connectDatabaseRestaurantConfig import connect_database

urllib3.disable_warnings()
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
        orderComments: str = Form(...),
        nation: str = Form(...),
    ):
        return cls(
            orderImage=[orderImage],
            orderName=orderName,
            orderDescription=orderDescription,
            orderPrice=orderPrice,
            orderState=orderState,
            orderComments=[orderComments],
            nation=nation,
        )
class StoreMetrics(BaseModel):
    CNPJ: str
    invoicing: float = 0.0
    orders: int = 0
    completed: int = 0
    progress: int = 0

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

    uf: str = ""
    nation: str = Field(default="")
    city: str=''
    state: str=''
    state_abbreviation: str=''
    latitude: str = ""
    longitude: str = ""

    @field_validator("CNPJ")
    @classmethod
    def validationCNPJ(cls, value):
        value = value.replace(".", "").replace("-", "").replace("/", "")
        if len(value) != 14:
            raise ValueError("Error: The CNPJ must have 14 digits.  ")
        if not value.isdigit():
            raise ValueError("INVALID CNPJ")
        return value

    @model_validator(mode="after")
    def validationCEP(self):
        try:
            
            cep = "".join(filter(str.isdigit, self.CEP))

            if not cep:
                raise ValueError("Invalid CEP")
            country = str(self.nation).strip().lower()
            url = f"https://api.zippopotam.us/{country}/{cep}"

            response = requests.get(url, timeout=5, verify=False)

            if response.status_code != 200:
                raise ValueError("Invalid CEP")

            data = response.json()

            if not data.get("places"):
                raise ValueError("Invalid CEP")

            place = data["places"][0]

            self.CEP = data.get("post code", cep)
        
            self.nation = data.get("country", "")
            self.city = place.get("place name", "")
            self.state = place.get("state", "")
            self.state_abbreviation = place.get("state abbreviation", "")
            self.uf = place.get("state abbreviation", "")
            self.latitude = place.get("latitude", "")
            self.longitude = place.get("longitude", "")
            return self

        except requests.RequestException :
            raise ValueError("Unable to validate CEP")

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
        nation: str = Form(...),
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
            restauranttag=[restauranttag],
            nation=nation,
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
        return {"cnpj": "", "cnpjExist": False, "error": "Error"}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
