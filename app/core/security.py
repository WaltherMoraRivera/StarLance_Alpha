from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

SECRET_KEY = "starlance-secret-key-mora-rivera-2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

USERS = {
    "admin": {
        "id": "user_admin",
        "username": "admin",
        "display_name": "Admin",
        "role": "admin",
        "avatar": "🛡️",
        "hashed_password": pwd_context.hash("admin2026"),
    },
    "gabriel": {
        "id": "user_gabriel",
        "username": "gabriel",
        "display_name": "Gabriel",
        "role": "kid",
        "avatar": "⚡",
        "hashed_password": pwd_context.hash("gabriel2026"),
    },
    "daniela": {
        "id": "user_daniela",
        "username": "daniela",
        "display_name": "Daniela",
        "role": "kid",
        "avatar": "🌟",
        "hashed_password": pwd_context.hash("daniela2026"),
    },
}


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
