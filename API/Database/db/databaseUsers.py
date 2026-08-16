from ..Config.connectDatabaseUser import connect_database_user


def create_database():
    conn = None
    cursor = None
    try:
        conn, cursor = connect_database_user()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users_Dailyfoods(
                id SERIAL PRIMARY KEY,
                email VARCHAR(350) UNIQUE NOT NULL,
                name_user VARCHAR(300) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                password VARCHAR(200) NOT NULL,
                CNPJ CHAR(14)  UNIQUE NOT NULL,
                CEP CHAR(9) NOT NULL,
                session_token UUID NOT NULL,
                money DECIMAL(10, 2) DEFAULT 0.0 NOT NULL,
                purchasedOrders INT DEFAULT 0 NOT NULL,
                Ban BOOL DEFAULT false,
                AttemptsLogin INT DEFAULT 0
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
