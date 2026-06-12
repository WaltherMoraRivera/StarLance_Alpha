from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.core.security import USERS, verify_password, create_access_token, decode_token
from app.db.mongodb import get_database

router = APIRouter(prefix="/auth", tags=["Auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = USERS.get(form_data.username.lower())
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    token = create_access_token({"sub": user["username"], "role": user["role"]})
    public = {k: v for k, v in user.items() if k != "hashed_password"}
    return {"access_token": token, "token_type": "bearer", "user": public}


@router.get("/me")
async def get_me(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")
    user = USERS.get(payload.get("sub"))
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return {k: v for k, v in user.items() if k != "hashed_password"}


@router.get("/users")
async def list_users():
    return [
        {"username": u["username"], "display_name": u["display_name"],
         "avatar": u["avatar"], "role": u["role"]}
        for u in USERS.values()
    ]


@router.get("/config")
async def get_config():
    db = get_database()
    config = await db.app_config.find_one({"_id": "starlance"})
    if not config:
        raise HTTPException(status_code=503, detail="App not initialized yet")
    return {"family_id": config["family_id"]}
