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
            CNPJ VARCHAR(14) NOT NULL UNIQUE,
            CEP VARCHAR(9) NOT NULL
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