"""Initialize family and task catalog on first startup."""
from app.db.mongodb import get_database
from app.repositories import family_repository
from app.schemas.family import FamilyCreate, Member, MemberRole

FAMILY_NAME = "Familia StarLance"

DEFAULT_CATALOG = [
    {"name": "Tender la cama", "description": "Dejar la cama ordenada y limpia", "stars": 2, "icon": "🛏️"},
    {"name": "Lavar los platos", "description": "Lavar y secar todos los platos", "stars": 3, "icon": "🍽️"},
    {"name": "Barrer el piso", "description": "Barrer la casa o tu habitación", "stars": 3, "icon": "🧹"},
    {"name": "Limpiar tu cuarto", "description": "Ordenar y limpiar la habitación", "stars": 4, "icon": "🏠"},
    {"name": "Sacar la basura", "description": "Llevar la basura al lugar indicado", "stars": 2, "icon": "🗑️"},
    {"name": "Lavar la ropa", "description": "Lavar y doblar la ropa", "stars": 5, "icon": "👕"},
    {"name": "Limpiar el baño", "description": "Limpiar lavamanos, inodoro y ducha", "stars": 5, "icon": "🚿"},
    {"name": "Hacer las tareas escolares", "description": "Completar todas las tareas del colegio", "stars": 4, "icon": "📚"},
    {"name": "Ayudar a cocinar", "description": "Ayudar a preparar una comida", "stars": 4, "icon": "🍳"},
    {"name": "Regar las plantas", "description": "Regar todas las plantas de la casa", "stars": 2, "icon": "🌱"},
]


async def init_app_data():
    db = get_database()

    # Check if family already exists
    config = await db.app_config.find_one({"_id": "starlance"})
    if config:
        return  # Already initialized

    # Create the family
    family = await family_repository.create_family(
        FamilyCreate(
            name=FAMILY_NAME,
            members=[
                Member(id="user_admin", name="Admin", role=MemberRole.parent, balance=0),
                Member(id="user_gabriel", name="Gabriel", role=MemberRole.child, balance=0),
                Member(id="user_daniela", name="Daniela", role=MemberRole.child, balance=0),
            ],
        )
    )

    # Seed task catalog
    await db.task_catalog.insert_many(
        [{**t, "is_active": True} for t in DEFAULT_CATALOG]
    )

    # Save config
    await db.app_config.insert_one({"_id": "starlance", "family_id": family["_id"]})
