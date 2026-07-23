from ..Config.connectDatabaseRestaurantConfig import connect_database
def create_databaseRC():
   
    conn = None
    cursor = None
    try:
        conn,cursor = connect_database()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS restaurantConfig(
                id SERIAL PRIMARY KEY,
                name VARCHAR(300) NOT NULL,       
                image VARCHAR(255),
                CNPJ CHAR(14) NOT NULL UNIQUE,
                CEP CHAR(9) NOT NULL,
                session_token UUID NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                invoicing NUMERIC(10,2) DEFAULT 0.0 NOT NULL,
                invoicing_history NUMERIC[] DEFAULT ARRAY[0, 0, 0, 0, 0, 0, 0],
                orders INT NOT NULL DEFAULT 0,
                completed  INT NOT NULL DEFAULT 0,
                progress INT NOT NULL DEFAULT 0,
                orderImage VARCHAR(255)[] DEFAULT ARRAY[]::VARCHAR(255)[],
                orderName VARCHAR(100)[] DEFAULT ARRAY[]::VARCHAR[100],
                orderPrice NUMERIC(10,2)[] DEFAULT ARRAY[]::NUMERIC(10,2)[],
                orderDescription VARCHAR(500)[] DEFAULT ARRAY[]::VARCHAR(500)[],
                orderState BOOLEAN[] DEFAULT ARRAY[]::BOOLEAN[],
                orderExists BOOLEAN[] DEFAULT ARRAY[false]::BOOLEAN[]
                )
        ''')
        conn.commit()
    except Exception as e:
        raise Exception(f'Error: {e}')
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
            