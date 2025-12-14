from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.database import ping_server, init_db
from core.config import settings
from routes import auth as auth_router
from routes import herds as herds_router
from routes import reflections as reflections_router
from routes import users as users_router
from routes import reactions as reactions_router
from routes import friends as friends_router
from routes import notifications as notifications_router

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    await init_db()

# CORS Middleware
router = APIRouter(prefix="/api/v1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://bright-wolf-hop-front.onrender.com",
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:5137",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@router.get("/healthz")
async def health_check():
    return await ping_server()

app.include_router(router)
app.include_router(auth_router.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(herds_router.router, prefix="/api/v1/herds", tags=["herds"])
app.include_router(reflections_router.router, prefix="/api/v1/reflections", tags=["reflections"])
app.include_router(users_router.router, prefix="/api/v1/users", tags=["users"])
app.include_router(reactions_router.router, prefix="/api/v1/reactions", tags=["reactions"])
app.include_router(friends_router.router, prefix="/api/v1/friends", tags=["friends"])
app.include_router(notifications_router.router, prefix="/api/v1/notifications", tags=["notifications"])

@app.get("/")
def root():
    return {"message": "Hello World"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000
    )