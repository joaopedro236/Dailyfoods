from ..Database.Config.connectDatabaseRestaurantConfig import connect_database
from pathlib import Path
def garbage_upload():
    conn = None
    cursor = None
    try:
        folder =  Path(r"C:\Users\patrick.araujo\Desktop\Joao\Dailyfoods\Uploads")
        folderOrders = Path(r"C:\Users\patrick.araujo\Desktop\Joao\Dailyfoods\UploadsOrders")
        conn, cursor = connect_database()
        command_sql = '''select image from restaurantConfig where image not like '5b3d97aba2d14fc2ade402e436c485a7.jpg' order by image asc '''
        cursor.execute(command_sql)
        result = cursor.fetchall()
        images = [row[0] for row in result]
        if images:
            for file in folder.iterdir():
                if file.is_file()and file.name not in images:
                    file.unlink()   
        command_sql_orders = '''select orderImage from restaurantConfig  order by orderImage asc '''
        cursor.execute(command_sql_orders)
        resultOrders = cursor.fetchall()
        imagesOrders = [
            image 
            for row in resultOrders 
            for image in row[0]
        ]
        if imagesOrders:
            for fileOrders in folderOrders.iterdir():
                if fileOrders.is_file() and fileOrders.name not in imagesOrders and fileOrders.name != '813789.png':
                    fileOrders.unlink()
    except Exception as e:
        raise Exception(f'Error: { str(e)}')
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close() 