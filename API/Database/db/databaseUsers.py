from ..Config.connectDatabaseUser import connect_database


def create_database():
    conn = None
    cursor = None
    try:
        conn, cursor = connect_database()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users_Dailyfoods(
                id SERIAL PRIMARY KEY,
                email VARCHAR(350) UNIQUE ,
                name_user VARCHAR(300) ,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CNPJ VARCHAR(14)  UNIQUE,
                CEP VARCHAR(9) 
            )
        """)
        conn.commit()
    except Exception as e:
        return {"Error": str(e)}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
