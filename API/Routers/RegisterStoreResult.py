from ..Database.Config.connectDatabaseRestaurantConfig import connect_database
from fastapi import APIRouter, Cookie, Response, UploadFile, Depends, Request
import uuid
from pathlib import Path
from ..Validation.RegisterStore import Store, Orders
from datetime import datetime

router = APIRouter()


@router.post("/api/registerStore")
async def register_store(
    response: Response,
    request: Request,
    data: Store = Depends(Store.as_form),
    
):
    conn = None
    cursor = None
    session_token = str(uuid.uuid4())
    dayWeek = datetime.today().weekday()
    Uploads = Path(__file__).resolve().parents[2] / "Uploads"
    UploadsOrders = Path(__file__).resolve().parents[2] / "UploadsOrders"
    Uploads.mkdir(exist_ok=True)
    UploadsOrders.mkdir(exist_ok=True)

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
    imageName_Orders = f"813789.png"
    image_url_orders = f"http://localhost:8000/uploadsOrders/{imageName_Orders}"
    try:
        form = await request.form()
        image_file = form.get("image")
        image_file_orders = form.get("image_orders")
        if image_file and image_file.filename:
            imageName = await save_image(image_file, Uploads)

        if image_file_orders and image_file_orders.filename:
            imageName_Orders = await save_image(image_file_orders, UploadsOrders)
            
        image_url = f"http://localhost:8000/uploads/{imageName}"
        image_url_orders = f"http://localhost:8000/uploadsOrders/{imageName_Orders}"
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
                        image = %s,
                        imageOrders = %s
                    WHERE CNPJ = %s
                """,
                    (imageName, imageName_Orders, data.CNPJ),
                )
                conn.commit()
                return {"Status": True, "token": store[0], "image": image_url,"imageOrders": image_url_orders,}

            command_sql = """ INSERT INTO restaurantConfig(name,image, CNPJ, CEP, session_token, invoicing, invoicing_history, orders, completed, progress, orderImage, orderName, orderPrice ,orderDescription, orderState)
                            VALUES (%s, %s,%s, %s, %s, %s, %s, %s ,%s, %s, %s, %s, %s, %s, %s)"""
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
                    [imageName_Orders],
                    None,
                    None,
                    None,
                    None,
                ),
            )
            conn.commit()
        except Exception as db_error:
            if conn:
                conn.rollback()
            image_url = image_url or f"http://localhost:8000/uploads/{imageName}"
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
                "imageOrders": image_url_orders,
                "warning": str(db_error),
            }

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
            "imageOrders": image_url_orders,
        }

    except Exception as e:
        if conn:
            conn.rollback()
        return {
            "Status": True,
            "token": session_token,
            "image": image_url,
            "imageOrders": image_url_orders,
            "warning": str(e),
        }
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@router.get("/api/store")
def get_store(
    restaurant_session_token: str = Cookie(default=None),
    session_token: str = Cookie(default=None),
):
    dayWeek = datetime.today().weekday()

    token = restaurant_session_token or session_token
    if token is None:
        return {"Status": False}
    try:
        conn, cursor = connect_database()
        cursor.execute(
            "SELECT name,image, CNPJ, CEP, invoicing, invoicing_history, orders, completed, progress, orderImage, orderName, orderPrice ,orderDescription, orderState FROM restaurantConfig WHERE session_token = %s",
            (token,),
        )
        store = cursor.fetchone()
        orderExists = False
        if store:
            if dayWeek == 0:
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
            if all(store[10] [11] [12] [13]):
               
                cursor.execute(''' UPDATE restaurantConfig 
                                SET orderExists = array[true] where session_token = %s''', (token,))
                orderExists = True
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
                'orderExists': orderExists
            }
        return {"Status": False}
    except Exception as e:
        return {"Status": False, "Error": str(e)}
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
        command_sql = """select id, name,image,cep,orderExists from restaurantConfig"""
        cursor.execute(command_sql)
        rows = cursor.fetchall()
        result = [
            {
                "id": row[0],
                "name": row[1],
                "image": f"http://localhost:8000/uploads/{row[2]}",
                "cep": row[3],
                "orderExists": row[4]
            }
            for row in rows
        ]
        return {"result": result}
    except Exception as e:
        raise e
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@router.put("/api/store/metrics")
def update_metrics(data: Store):
    conn, cursor = connect_database()
    cursor.execute(
        "SELECT invoicing_history FROM restaurantConfig WHERE CNPJ = %s", (data.CNPJ,)
    )
    result = cursor.fetchone()
    if result is None:
        return {"Status": False, "Error": "CNPJ não encontrado"}

    history = [float(x) for x in result[0]]
    day = datetime.today().weekday()
    history[day] = float(data.invoicing)
    cursor.execute(
        """
        UPDATE restaurantConfig
        SET 
            invoicing = %s,
            invoicing_history = %s,
            orders = %s,
            completed = %s,
            progress = %s
        WHERE CNPJ = %s
    """,
        (
            data.invoicing,
            history,
            data.orders,
            data.completed,
            data.progress,
            data.CNPJ,
        ),
    )

    conn.commit()
    return {"Status": True}
