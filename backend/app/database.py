from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection
from beanie import init_beanie
from core.config import settings
from models.user import User
from models.herd import Herd
from models.reflection import Reflection, Reaction
from models.friend import Friend
from models.notification import Notification

async def get_collection(name: str) -> "AsyncIOMotorCollection":
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client.get_database("bright-wolf-hop")
    return db[name]

async def init_db():
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client.get_database("bright-wolf-hop")
    
    await init_beanie(
        database=db,
        document_models=[
            User,
            Herd,
            Reflection,
            Friend,
            Reaction,
            Notification
        ]
    )

async def ping_server():
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URI)
        await client.admin.command("ping")
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "details": str(e)}