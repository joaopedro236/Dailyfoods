from ..Config.connectDatabaseUser import connect_database


def create_database():
    conn = None
    cursor = None
    try:
        conn, cursor = connect_database()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users_Dailyfoods(
                id SERIAL PRIMARY KEY,
                email VARCHAR(350) UNIQUE NOT NULL,
                name_user VARCHAR(300) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                password VARCHAR(200) NOT NULL,
                CNPJ VARCHAR(14)  UNIQUE NOT NULL,
                CEP VARCHAR(9) NOT NULL,
                session_token UUID NOT NULL
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
