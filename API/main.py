from API.Database.db.databaseRestaurantConfig import create_databaseRC
from API.Database.db.databaseUsers import create_database
from API.Validation.RegisterStore import router as registerStore_verification
from API.Validation.RegisterUser import router as registerUser_verification  
from API.Routers.RegisterStoreResult import router as registerStore_result
from API.Routers.RegisterUserResult import router as registerUser_result
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path
app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir arquivos estáticos da pasta Uploads
uploads_path = Path("Uploads")
if uploads_path.exists():
    app.mount("/uploads", StaticFiles(directory="Uploads"), name="uploads")

app.include_router(registerStore_verification)
app.include_router(registerStore_result)
app.include_router(registerUser_verification)
app.include_router(registerUser_result)
@app.on_event('startup')
def startup():
    create_database()
    create_databaseRC()