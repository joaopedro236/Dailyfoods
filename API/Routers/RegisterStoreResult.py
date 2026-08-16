from ..Database.Config.connectDatabaseRestaurantConfig import connect_database
from fastapi import (
    APIRouter,
    Form,
    Cookie,
    Response,
    UploadFile,
    Depends,
    Request,
    File,
    Header,
)
import uuid
from PIL import Image
from io import BytesIO
from ..Database.Config.connectDatabaseUser import connect_database_user
import numpy as np
from pathlib import Path
from ..Validation.RegisterStore import Store, Orders
from datetime import datetime
import ollama
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from ..Validation.LoginStore import LoginStore

ph = PasswordHasher()
router = APIRouter()


@router.post("/api/registerStore")
async def register_store(
    request: Request,
    response: Response,
    data: Store = Depends(Store.as_form),
    image: UploadFile = File(None),
):

    conn = None
    cursor = None
    session_token = str(uuid.uuid4())
    dayWeek = datetime.today().weekday()
    Uploads = Path(__file__).resolve().parents[2] / "Uploads"
    Uploads.mkdir(exist_ok=True)
    user_token = request.cookies.get("user_session_token")

    async def save_image(file: UploadFile, folder: Path):
        filename = file.filename or "upload"
        extension = Path(filename).suffix or ".jpg"
        name = f"{uuid.uuid4().hex}{extension}"
        way = folder / name
        with open(way, "wb") as f:
            f.write(await file.read())
        return name

    imageName = "219eaea67aafa864db091919ce3f5d82.jpg"
    image_url = f"http://localhost:8000/uploads/{imageName}"
    try:
        try:
            PROMPT_PATH = (
                Path(__file__).parent.parent / "prompts" / "restaurantName.txt"
            )

            with open(PROMPT_PATH, "r", encoding="utf-8") as file:
                prompt = file.read()
            moderation = ollama.chat(
                model="llama3.2:3b",
                messages=[
                    {
                        "role": "system",
                        "content": prompt,
                    },
                    {"role": "user", "content": data.name},
                ],
                options={"temperature": 0},
            )

            result = moderation["message"]["content"].strip().upper()

            if "BLOCK" in result:
                return {"Status": False, "Error": "Invalid restaurant name."}
        except Exception as e:
            return {"Status": False, "Error": "Unable to validate restaurant name."}
        if image:
            image_data = await image.read()

            if len(image_data) > 5 * 1024 * 1024:
                return {"Status": False, "Error": "Image is too large."}

            try:
                img = Image.open(BytesIO(image_data))

                if img.format != "JPEG":
                    return {"Status": False, "Error": "Only JPEG images are allowed."}

                if img.width > 2000 or img.height > 2000:
                    return {"Status": False, "Error": "Image dimensions are too large."}

                img.verify()

            except Exception:
                return {"Status": False, "Error": "Invalid image."}

            await image.seek(0)
            image.file.write(image_data)
            image.file.seek(0)

            imageName = await save_image(image, Uploads)
        if image:
            imageName = await save_image(image, Uploads)

        image_url = f"http://localhost:8000/uploads/{imageName}"

        invoicing_history = [0.0] * 7
        invoicing_history[dayWeek] = float(data.invoicing)
        try:

            conn, cursor = connect_database()
            cursor.execute(
                "SELECT session_token FROM restaurantConfig WHERE CNPJ = %s",
                (data.CNPJ,),
            )
            store = cursor.fetchone()
            if store:
                cursor.execute(
                    """
                    UPDATE restaurantConfig
                    SET 
                        image = %s
                    WHERE CNPJ = %s
                    """,
                    (imageName, data.CNPJ),
                )
                conn.commit()

                response.set_cookie(
                    key="restaurant_session_token",
                    value=store[0],
                    httponly=True,
                    max_age=60 * 60 * 24 * 7,
                    samesite="lax",
                    path="/",
                )

                return {"Status": True, "token": store[0], "image": image_url}
            hash_password = ph.hash(data.password)
            command_sql = """ INSERT INTO restaurantConfig(name,image, CNPJ, CEP, session_token, invoicing, invoicing_history, orders, completed, progress, password, restauranttag, owner_token)
                            VALUES (%s, %s,%s, %s, %s, %s, %s, %s ,%s, %s, %s, %s,%s)"""
            cursor.execute(
                command_sql,
                (
                    data.name,
                    imageName,
                    data.CNPJ,
                    data.CEP,
                    session_token,
                    data.invoicing,
                    invoicing_history,
                    data.orders,
                    data.completed,
                    data.progress,
                    hash_password,
                    data.restauranttag,
                    user_token,
                ),
            )
            conn.commit()
        except Exception as db_error:
            if conn:
                conn.rollback()

            return {"Status": False, "Error": "Unable to register restaurant."}

        response.set_cookie(
            key="restaurant_session_token",
            value=session_token,
            httponly=True,
            max_age=60 * 60 * 24 * 7,
            samesite="lax",
            path="/",
        )
        return {
            "Status": True,
            "token": session_token,
            "image": image_url,
        }

    except Exception:
        if conn:
            conn.rollback()
        return {"Status": False, "token": session_token, "image": image_url}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@router.get("/api/store")
def get_store(
    restaurant_session_token: str = Cookie(default=None),
    session_token: str = Cookie(default=None),
    authorization: str = Header(default=None),
):
    dayWeek = datetime.today().weekday()
    conn = None
    cursor = None
    token = restaurant_session_token or session_token or authorization

    if token is None:
        return {"Status": False, "error": "none   token"}
    try:
        conn, cursor = connect_database()
        cursor.execute(
            "SELECT name,image, CNPJ, CEP, invoicing, invoicing_history, orders, completed, progress, orderImage, orderName, orderPrice ,orderDescription, orderState, restauranttag,restaurantComments FROM restaurantConfig WHERE session_token = %s",
            (token,),
        )
        store = cursor.fetchone()
        orderExists = False
        if store:
            if dayWeek == 0 and store[5] != [0.0] * 7:
                cursor.execute(
                    """
                    UPDATE restaurantConfig 
                    SET 
                    invoicing = 0,
                    invoicing_history = %s,
                    orders = 0,
                    completed = 0,
                    progress = 0
                    WHERE session_token = %s
                """,
                    ([0.0] * 7, token),
                )
                conn.commit()

                store = list(store)
                store[4] = 0.0
                store[5] = [0.0] * 7
                store[6] = 0
                store[7] = 0
                store[8] = 0
            if all([store[10], store[11], store[12], store[13]]):

                cursor.execute(
                    """ UPDATE restaurantConfig 
                                SET orderExists = true where session_token = %s""",
                    (token,),
                )
                orderExists = True
            else:
                cursor.execute(
                    """
                    UPDATE restaurantConfig
                    SET orderExists = false
                    WHERE session_token = %s
                """,
                    (token,),
                )
                orderExists = False
            conn.commit()
            orderPriceMean = float(np.mean(store[11])) if store[11] else 0
            return {
                "Status": True,
                "name": store[0],
                "image": f"http://localhost:8000/uploads/{store[1]}",
                "CNPJ": store[2],
                "CEP": store[3],
                "invoicing": store[4],
                "invoicing_history": store[5],
                "orders": store[6],
                "completed": store[7],
                "progress": store[8],
                "orderName": store[10],
                "orderPrice": store[11],
                "orderDescription": store[12],
                "orderState": store[13],
                "orderExists": orderExists,
                "orderPriceMean": orderPriceMean,
                "restauranttag": store[14],
                "restaurantComments": store[15],
            }
        return {"Status": False}
    except Exception as e:
        return {"Status": False, "Error": "Error"}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@router.get("/api/restaurants")
def restaurants():
    conn = None
    cursor = None
    try:
        conn, cursor = connect_database()
        command_sql = """select id, name,image,cep,orderExists,orderImage, orderName, OrderPrice, OrderDescription,OrderState, restauranttag,restaurantComments from restaurantConfig"""
        cursor.execute(command_sql)
        rows = cursor.fetchall()
        result = [
            {
                "id": row[0],
                "name": row[1],
                "image": f"http://localhost:8000/uploads/{row[2]}",
                "cep": row[3],
                "orderExists": row[4],
                "orderImage": row[5],
                "orderName": row[6],
                "orderPrice": row[7],
                "orderDescription": row[8],
                "orderState": row[9],
                "restauranttag": row[10],
                "restaurantComments": row[11],
            }
            for row in rows
        ]
        return {"result": result}
    except Exception:
        return "Error"
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@router.put("/api/store/metrics")
def update_metrics(data: Store):
    conn = None
    cursor = None
    try:
        conn, cursor = connect_database()
        cursor.execute(
            """SELECT invoicing_history, cardinality(orderstate)
    FROM restaurantConfig
    WHERE CNPJ = %s""",
            (data.CNPJ,),
        )
        result = cursor.fetchone()
        if result is None:
            return {"Status": False, "Error": "CNPJ not found"}
        history = [0.0] * 7
        day = datetime.today().weekday()
        history[day] = float(data.invoicing)
        cursor.execute(
            """
            
            UPDATE restaurantConfig
SET
    invoicing_history = %s,
    orders = %s,
    completed = %s,
    progress = %s
WHERE CNPJ = %s
        """,
            (
                history,
                data.orders,
                data.completed,
                data.progress,
                data.CNPJ,
            ),
        )
        conn.commit()
        return {"Status": True, "orders": result[1], "invoicing_history": result[0]}
    except Exception:
        if conn:
            conn.rollback()
        return {"Status": False, "Error": "Error"}

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


from typing import Optional


@router.post("/orders")
async def orders(
    request: Request,
    restaurantId: int = Form(None),
    orderName: Optional[str] = Form(None),
    orderDescription: Optional[str] = Form(None),
    orderPrice: Optional[float] = Form(None),
    image_orders: UploadFile = File(None),
    restaurantComments: Optional[str] = Form(None),
):
    conn = None
    cursor = None
    token = request.cookies.get("restaurant_session_token")
    try:
        try:
            PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "comments.txt"
            with open(PROMPT_PATH, "r", encoding="utf-8") as file:
                prompt = file.read()
                if restaurantComments:
                    moderation = ollama.chat(
                        model="llama3.2:3b",
                        messages=[
                            {
                                "role": "system",
                                "content": prompt,
                            },
                            {"role": "user", "content": restaurantComments},
                        ],
                        options={"temperature": 0},
                    )

                    result = moderation["message"]["content"].strip().upper()

                    if result == "BLOCK":
                        return {"Status": False, "Error": "Invalid comment."}
        except Exception:
            return {"Status": False, "Error": "Unable to validate restaurant name."}

        UploadsOrders = Path(__file__).resolve().parents[2] / "UploadsOrders"
        UploadsOrders.mkdir(exist_ok=True)
        if restaurantComments and not orderName:
            conn, cursor = connect_database()
            cursor.execute(
                """
        UPDATE restaurantConfig
        SET restaurantComments = array_append(
            COALESCE(restaurantComments, ARRAY[]::text[]),
            %s
        )
        WHERE  session_token = %s
        """,
                (restaurantComments, token),
            )

            conn.commit()
            return {"Status": True}

        if image_orders is None:
            return {"Status": False, "Error": "No image provided"}

        image_data = await image_orders.read()

        if len(image_data) > 5 * 1024 * 1024:
            return {"Status": False, "Error": "Image is too large."}

        try:
            img = Image.open(BytesIO(image_data))

            if img.format != "JPEG":
                return {"Status": False, "Error": "Only JPEG images are allowed."}

            if img.width > 2000 or img.height > 2000:
                return {"Status": False, "Error": "Image dimensions are too large."}

            img.verify()

        except Exception:
            return {"Status": False, "Error": "Invalid image."}

        image_name = f"{uuid.uuid4().hex}.jpg"

        with open(UploadsOrders / image_name, "wb") as f:
            f.write(image_data)

        conn, cursor = connect_database()

        cursor.execute(
            """
            UPDATE restaurantConfig
            SET
                orderImage = array_append(COALESCE(orderImage, ARRAY[]::text[]), %s),
orderName = array_append(COALESCE(orderName, ARRAY[]::text[]), %s),
orderPrice = array_append(COALESCE(orderPrice, ARRAY[]::double precision[]), %s),
orderDescription = array_append(COALESCE(orderDescription, ARRAY[]::text[]), %s),
orderState = array_append(COALESCE(orderState, ARRAY[]::boolean[]), %s)
            WHERE session_token = %s
        """,
            (image_name, orderName, orderPrice, orderDescription, True, token),
        )

        conn.commit()

        return {"Status": True}

    except Exception:
        if conn:
            conn.rollback()
        return {"Status": False, "Error": "Error"}
  


@router.get("/orders_items")
def orders_items(request: Request, restaurant_session_token: str | None = None):
    conn = None
    cursor = None
    token = restaurant_session_token or request.cookies.get("restaurant_session_token")
    if not token:
        return {"Status": False}

    try:
        conn, cursor = connect_database()
        command_sql = """
        SELECT
            orderImage,
            orderName,
            orderPrice,
            orderDescription,
            orderState,
            restaurantComments
        FROM restaurantConfig
        WHERE session_token = %s"""
        cursor.execute(command_sql, (token,))
        result = cursor.fetchone()
        if not result:
            return {"Status": False}
        orders = []
        orderPriceMean = float(np.mean(result[2])) if result[2] else 0
        for i in range(len(result[1])):
            orders.append(
                {
                    "image": f"http://localhost:8000/uploadsOrders/{result[0][i] if i < len(result[0]) else ''}",
                    "name": result[1][i],
                    "price": result[2][i],
                    "description": result[3][i],
                    "state": result[4][i],
                    "comments": result[5] or [],
                }
            )

        return {"Status": True, "orders": orders, "orderPriceMean": orderPriceMean}
    except Exception:
        return {"Status": False, "Error": "Error"}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def ban(conn,cursor, token):
    try:
        
        cursor.execute(
            """
            UPDATE users_Dailyfoods 
            SET Ban = True
            WHERE session_token = %s""",
            (token,),
        )
        cursor.execute(
            """
        UPDATE users_Dailyfoods
        SET timeBan = NOW() + INTERVAL '1 day'
        WHERE session_token = %s""",
            (token,),
        )
        conn.commit()
        return {"Status": False, "Ban": True}
    except Exception:
        return {"Status": False, "Ban": True}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@router.post("/api/loginStore")
def login_Store(data: LoginStore, response: Response, request: Request):
    conn = None
    cursor = None
    connUser = None
    cursorUser = None
    tokenUser = request.cookies.get("user_session_token")
    try:
        conn, cursor = connect_database()
        connUser, cursorUser = connect_database_user()
        cursor.execute(
            "SELECT password, session_token FROM restaurantConfig WHERE CNPJ = %s",
            (data.CNPJ,),
        )
        restaurant = cursor.fetchone()
        if not restaurant:
            cursorUser.execute(
                """
            UPDATE users_Dailyfoods
            SET AttemptsLogin = AttemptsLogin +1 
            WHERE session_token = %s""",
                (tokenUser,),
            )
            connUser.commit()
            cursorUser.execute(
                "SELECT AttemptsLogin from users_Dailyfoods WHERE session_token = %s",
                (tokenUser,),
            )
            responseCursor = cursorUser.fetchall()

            if responseCursor and responseCursor[0][0] >= 20:
                ban(connUser, cursorUser, tokenUser)
                return {"Status": False, "Ban": True}
            return {"Status": False}
        ph.verify(restaurant[0], data.password)
        response.set_cookie(
            key="restaurant_session_token",
            value=restaurant[1],
            httponly=True,
            max_age=60 * 60 * 24 * 7,
            samesite="lax",
            secure=False,
            path="/",
        )
        return {"Status": True, "token": restaurant[1]}

    except VerifyMismatchError:
        cursorUser.execute(
            """
            UPDATE users_Dailyfoods
            SET AttemptsLogin = AttemptsLogin + 1
            WHERE session_token = %s
            """,
            (tokenUser,),
        )
        connUser.commit()
        cursorUser.execute(
            """
            SELECT AttemptsLogin
            FROM users_Dailyfoods
            WHERE session_token = %s
            """,
            (tokenUser,),
        )

        attempts = cursorUser.fetchone()[0]

        if attempts >= 20:
            return ban(connUser,cursorUser, tokenUser)

        return {"Status": False}


@router.post("/addMoney")
def add_money(request: Request):
    conn = None
    cursor = None
    token = request.cookies.get("restaurant_session_token")
    if not token:
        return {"Status": False, "Error": "No restaurant session found"}
    try:
        conn, cursor = connect_database()
        cursor.execute(
            """
            UPDATE restaurantConfig
    SET invoicing = invoicing +100
    WHERE session_token = %s
    RETURNING invoicing
            """,
            (token,),
        )
        result = cursor.fetchone()
        if not result:
            return {"Status": False, "Error": "Restaurant not found"}
        conn.commit()
        return {"Status": True, "result": result[0]}
    except Exception:
        return {"Status": False, "Error": "Error"}
    finally:
        cursor.close()
        conn.close()


@router.post("/pay")
def pay(
    request: Request,
    orderPrice: float = Form(None),
):
    conn = None
    cursor = None
    connUser = None
    cursorUser = None
    token = request.cookies.get("restaurant_session_token")
    tokenUser = request.cookies.get("user_session_token")
    if not token or not tokenUser:
        return {"Status": False, "Error": "No restaurant session found"}
    if orderPrice is None:
        return {"Status": False, "Error": "Order price not provided"}

    try:
        conn, cursor = connect_database()
        connUser, cursorUser = connect_database_user()
        cursorUser.execute(
            """SELECT money, purchasedorders FROM users_Dailyfoods WHERE session_token = %s""",
            (tokenUser,),
        )
        resultUser = cursorUser.fetchall()
        cursor.execute(
            """SELECT invoicing,owner_token FROM restaurantConfig WHERE session_token = %s""",
            (token,),
        )
        resultRestaurant = cursor.fetchone()
        if resultRestaurant[1] == tokenUser:
            return {"Status": False, "Error": "You cannot pay for your own restaurant."}
        if resultUser[0][0] >= orderPrice:
            cursorUser.execute(
                """
                UPDATE users_Dailyfoods
                    SET
                        money = money - %s,
                        purchasedorders = purchasedorders +1
                    WHERE session_token = %s
            """,
                (orderPrice, tokenUser),
            )
            cursor.execute(
                """
                UPDATE restaurantConfig
                SET 
                    invoicing = invoicing + %s
                WHERE session_token = %s""",
                (orderPrice, token),
            )
            conn.commit()
            connUser.commit()
            return {"Status": True, "Message": "Payment successful"}
        else:
            return {
                "Status": False,
                "Error": "Unfortunately, the user does not have a sufficient balance.",
            }
    except Exception:
        return {"Status": False, "Error": "Error"}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        if cursorUser:
            cursorUser.close()
        if connUser:
            connUser.close()


@router.put("/api/store/image")
async def update_store_image(request: Request, image: UploadFile = File(...)):
    conn = None
    cursor = None

    try:
        token = request.cookies.get("restaurant_session_token")

        if not token:
            return {"Status": False, "Error": "No restaurant session found"}

        image_data = await image.read()

        if len(image_data) > 5 * 1024 * 1024:
            return {"Status": False, "Error": "Image is too large."}

        try:
            img = Image.open(BytesIO(image_data))

            if img.format != "JPEG":
                return {"Status": False, "Error": "Only JPEG images are allowed."}

            if img.width > 2000 or img.height > 2000:
                return {"Status": False, "Error": "Image dimensions are too large."}

            img.verify()

        except Exception:
            return {"Status": False, "Error": "Invalid image."}

        Uploads = Path(__file__).resolve().parents[2] / "Uploads"
        Uploads.mkdir(exist_ok=True)

        extension = Path(image.filename or "").suffix or ".jpg"
        imageName = f"{uuid.uuid4().hex}{extension}"

        with open(Uploads / imageName, "wb") as f:
            f.write(image_data)

        conn, cursor = connect_database()

        cursor.execute(
            """
            UPDATE restaurantConfig
            SET image = %s
            WHERE session_token = %s
            """,
            (imageName, token),
        )

        if cursor.rowcount == 0:
            return {"Status": False, "Error": "Restaurant not found"}

        conn.commit()

        return {"Status": True, "image": f"http://localhost:8000/uploads/{imageName}"}

    except Exception:
        if conn:
            conn.rollback()

        return {"Status": False, "Error": "Error"}

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@router.post('/ban_verification')
def ban_verification(request: Request):
    conn = None
    cursor = None
    tokenUser = request.cookies.get("user_session_token")
    try:
        conn,cursor = connect_database_user()
        cursor.execute("SELECT Ban from users_Dailyfoods WHERE session_token = %s", (tokenUser, ))
        response = cursor.fetchone()
        if response: return{"Status": True, 'Ban': True} 
    except Exception:
        return{"Status": False, "Error": 'Error'}