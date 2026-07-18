
from ..Database.Config.connectDatabaseRestaurantConfig import connect_database
from fastapi import APIRouter ,Cookie, Response, UploadFile, Depends, Request
import uuid
from pathlib import Path
from ..Validation.RegisterStore import Store
from datetime import datetime
router = APIRouter()
@router.post("/api/registerStore")
async def register_store(response: Response, request: Request, data: Store = Depends(Store.as_form)):
    conn = None
    cursor = None
    session_token = str(uuid.uuid4())
    dayWeek = datetime.today().weekday()
    Uploads = Path(__file__).resolve().parents[2] / 'Uploads'
    Uploads.mkdir(exist_ok=True)

    async def save_image(file: UploadFile):
        filename = file.filename or 'upload'
        extension = Path(filename).suffix or '.jpg'
        name = f'{uuid.uuid4().hex}{extension}'
        way = Uploads / name
        with open(way, 'wb') as f:
            f.write(await file.read())
        return name

    imageName = '219eaea67aafa864db091919ce3f5d82.jpg'
    image_url = f"http://localhost:8000/uploads/{imageName}"

    try:
        form = await request.form()
        image_file = form.get("image")
        if image_file is not None and hasattr(image_file, "filename") and getattr(image_file, "filename", None):
            imageName = await save_image(image_file)
            image_url = f"http://localhost:8000/uploads/{imageName}"

        invoicing_history = [0.0] * 7
        invoicing_history[dayWeek] = float(data.invoicing)

        try:
            conn, cursor = connect_database()
            cursor.execute("SELECT session_token FROM restaurantConfig WHERE CNPJ = %s", (data.CNPJ,))
            store = cursor.fetchone()
            if store:
                cursor.execute("""
                    UPDATE restaurantConfig
                    SET image = %s
                    WHERE CNPJ = %s
                """, (imageName, data.CNPJ))
                conn.commit()
                return {
                    "Status": True,
                    "token": store[1],
                    "image": image_url
                }
            

            command_sql = """ INSERT INTO restaurantConfig(name,image, CNPJ, CEP, session_token, invoicing, invoicing_history, orders, completed, progress)
                            VALUES (%s, %s,%s, %s, %s, %s, %s, %s ,%s, %s)"""
            cursor.execute(command_sql, (data.name, imageName, data.CNPJ, data.CEP, session_token, data.invoicing, invoicing_history, data.orders, data.completed, data.progress))
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
                "warning": str(db_error)
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
            "image": image_url
        }

    except Exception as e:
        if conn:
            conn.rollback()
        return {"Status": True, "token": session_token, "image": image_url, "warning": str(e)}
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
            "SELECT name,image, CNPJ, CEP, invoicing, invoicing_history, orders, completed, progress FROM restaurantConfig WHERE session_token = %s",
            (token,),
        )
        store = cursor.fetchone()
        if store:
            if dayWeek == 0:
                cursor.execute('''
                    UPDATE restaurantConfig SET invoicing_history = %s WHERE  session_token = %s
                ''', ([0.0] *7, token))
                conn.commit()
                store = list(store)
                store[4] = [0.0] *7
            return {"Status": True, "name": store[0],'image':f"http://localhost:8000/uploads/{store[1]}", "CNPJ": store[2], "CEP": store[3], 'invoicing': store[4], 'invoicing_history': store[5], 'orders': store[6], 'completed': store[7], 'progress': store[8]}
        return {"Status": False}
    except Exception as e:
        return {"Status": False, "Error": str(e)}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
@router.get('/api/restaurants')
def restaurants():
    conn = None
    cursor = None
    try:
        conn, cursor = connect_database()
        command_sql = '''select id, name,image, cep from restaurantConfig'''
        cursor.execute(command_sql)
        rows = cursor.fetchall()
        result = [
            {
                'id':row[0],
                'name': row[1],
                'image': f"http://localhost:8000/uploads/{row[2]}",
                'cep': row[3],
            }
            for row in rows
        ]
        return{'result': result}
    except Exception as e:
        raise e
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()