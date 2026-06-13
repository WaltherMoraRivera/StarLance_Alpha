# Documentación Técnica — StarLance Alpha v1.0

**Proyecto:** Sistema gamificado de tareas del hogar para la Familia Mora Rivera  
**Repositorio:** https://github.com/WaltherMoraRivera/StarLance_Alpha  
**URL producción:** https://starlancealpha-production.up.railway.app  
**Versión:** 1.0.0  
**Fecha:** Junio 2026

---

## Índice

1. [Origen del proyecto](#1-origen-del-proyecto)
2. [Decisiones de arquitectura](#2-decisiones-de-arquitectura)
3. [Stack tecnológico completo](#3-stack-tecnológico-completo)
4. [Estructura de la base de datos](#4-estructura-de-la-base-de-datos)
5. [Flujo de autenticación](#5-flujo-de-autenticación)
6. [Flujo de tareas](#6-flujo-de-tareas)
7. [Flujo de recompensas](#7-flujo-de-recompensas)
8. [Diseño del frontend](#8-diseño-del-frontend)
9. [Deploy y CI/CD](#9-deploy-y-cicd)
10. [Historial de bugs resueltos](#10-historial-de-bugs-resueltos)
11. [Decisiones descartadas](#11-decisiones-descartadas)

---

## 1. Origen del proyecto

El proyecto nació de un repositorio base llamado `starlance-api` — una API REST en FastAPI con MongoDB que ya tenía implementada la lógica de familias, tareas, recompensas y balance. Ese repo fue clonado a `StarLance_Alpha` como punto de partida.

### Requisitos del usuario

- **3 usuarios fijos:** Admin (padre/madre), Gabriel, Daniela
- **Login:** pantalla estilo Netflix con selección de avatar y contraseña
- **"Recordarme":** sesión persistente en `localStorage`
- **Flujo de tareas:** niños seleccionan tareas que completaron (hoy o ayer) → admin aprueba o rechaza → si aprueba, se suman estrellas al balance
- **Catálogo de tareas:** predefinido con 10 tareas, administrable por el admin
- **Recompensas:** admin crea premios con costo en estrellas, niños los canjean
- **Historial:** cada niño puede ver sus estrellas ganadas y el historial completo
- **Ajuste manual:** admin puede sumar o restar estrellas a un niño en cualquier momento
- **Estilo:** gaming / arcade, mobile-first, fondo negro con estrellas animadas
- **Deploy:** una sola URL pública accesible desde celular

---

## 2. Decisiones de arquitectura

### Monorepo frontend + backend

Se optó por un **monorepo**: el frontend React vive en `/frontend` dentro del mismo repositorio que el backend FastAPI. En producción, FastAPI sirve el build estático de React a través de un catch-all SPA, eliminando la necesidad de dos servicios separados o un CDN.

```
Navegador → Railway URL → FastAPI
                            ├── /api/*         → endpoints JSON
                            ├── /assets/*      → JS/CSS compilados
                            └── /*             → index.html (React Router toma el control)
```

### Usuarios hardcodeados

Los tres usuarios (admin, gabriel, daniela) están definidos directamente en `app/core/security.py` como un diccionario en memoria. No hay registro de usuarios ni colección `users` en MongoDB. Esta decisión simplifica el código al máximo para una app familiar de uso privado: no hay que gestionar creación de cuentas, reseteo de contraseñas ni roles dinámicos.

Las contraseñas se hashean con `bcrypt` al iniciar el módulo (una sola vez al arrancar el servidor).

### JWT con 30 días de expiración

Los tokens JWT tienen expiración de 30 días para soportar el "recordarme". El token se guarda en `localStorage` (recuérdame activo) o `sessionStorage` (sesión temporal). Al recargar la página, `AuthContext` lee el token almacenado y restaura la sesión sin llamar al servidor.

### Seed automático en startup

Al arrancar la app por primera vez, `init_app_data()` detecta si ya existe la familia en MongoDB (vía colección `app_config`). Si no existe, crea la familia con sus tres miembros y siembra el catálogo con 10 tareas predefinidas. En arranques posteriores, la función retorna inmediatamente. Esto garantiza que la base de datos esté lista sin pasos manuales de migración.

### Prefijo `/api` en todos los endpoints

El frontend usa Axios con `baseURL: '/api'`. Todas las rutas del backend están montadas bajo el prefijo `/api` en `main.py`:

```python
app.include_router(auth_router.router, prefix="/api")
app.include_router(catalog_router.router, prefix="/api")
# etc.
```

Esto permite que en desarrollo el proxy de Vite reenvíe `/api/*` al backend en `localhost:8000`, y en producción las llamadas vayan directamente al mismo servidor.

---

## 3. Stack tecnológico completo

### Backend

| Paquete | Versión | Uso |
|---|---|---|
| FastAPI | 0.136.x | Framework HTTP asincrónico |
| Uvicorn | 0.49.x | Servidor ASGI (con uvloop) |
| Motor | 3.7.x | Driver async para MongoDB |
| PyMongo | 4.17.x | Driver base de Motor |
| Pydantic | 2.13.x | Validación de esquemas |
| pydantic-settings | 2.14.x | Configuración desde `.env` |
| python-jose[cryptography] | 3.5.x | Generación y validación de JWT |
| bcrypt | 5.0.x | Hash de contraseñas |
| python-multipart | 0.0.32 | Parseo de form data (necesario para OAuth2PasswordRequestForm) |
| python-dotenv | 1.2.x | Lectura de archivo `.env` |

### Frontend

| Paquete | Versión | Uso |
|---|---|---|
| React | 18.x | UI library |
| React Router DOM | 6.x | Navegación SPA |
| Vite | 8.x | Build tool y dev server |
| Tailwind CSS | 3.x | Estilos utility-first |
| Axios | 1.x | Cliente HTTP |
| @vitejs/plugin-react | — | Soporte JSX con Babel |

### Infraestructura

| Servicio | Plan | Uso |
|---|---|---|
| Railway | Hobby | Hosting del contenedor Docker |
| MongoDB Atlas | M0 (free) | Base de datos en la nube |
| GitHub | Free | Repositorio + CI (push triggers) |

---

## 4. Estructura de la base de datos

### Colección `families`

```json
{
  "_id": ObjectId,
  "name": "Familia StarLance",
  "members": [
    { "id": "user_admin",   "name": "Admin",   "role": "parent", "balance": 0 },
    { "id": "user_gabriel", "name": "Gabriel", "role": "child",  "balance": 0 },
    { "id": "user_daniela", "name": "Daniela", "role": "child",  "balance": 0 }
  ]
}
```

### Colección `task_catalog`

```json
{
  "_id": ObjectId,
  "name": "Tender la cama",
  "description": "Dejar la cama ordenada y limpia",
  "stars": 2,
  "icon": "🛏️",
  "is_active": true
}
```

### Colección `tasks`

Representa una instancia de tarea enviada por un niño en un día concreto.

```json
{
  "_id": ObjectId,
  "title": "Tender la cama",
  "description": "...",
  "points": 2,
  "assigned_to_id": "user_gabriel",
  "family_id": "...",
  "status": "completed",
  "task_type": "daily",
  "task_date": "2026-06-13",
  "icon": "🛏️",
  "catalog_id": "...",
  "created_at": ISODate
}
```

**Estados del campo `status`:**

| Estado | Significado |
|---|---|
| `completed` | Niño envió la tarea (dice haberla hecho), esperando aprobación del admin |
| `approved` | Admin aprobó — se suman estrellas al balance |
| `rejected` | Admin rechazó — no se suman estrellas |

> Nota: el estado `pending` existe en el enum pero no se usa en producción. Las tareas se crean directamente como `completed` porque el acto de "enviar" implica que el niño las completó.

### Colección `rewards`

```json
{
  "_id": ObjectId,
  "name": "1 hora de videojuegos",
  "description": "...",
  "cost": 15,
  "icon": "🎮",
  "is_active": true,
  "family_id": "..."
}
```

### Colección `transactions`

Registro inmutable de cada movimiento de estrellas.

```json
{
  "_id": ObjectId,
  "user_id": "user_gabriel",
  "type": "earn",
  "amount": 2,
  "description": "Tarea aprobada: Tender la cama",
  "task_id": "...",
  "created_at": ISODate
}
```

**Tipos de transacción:**
- `earn` — estrellas ganadas (aprobación de tarea o ajuste manual positivo)
- `redeem` — estrellas gastadas (canje de recompensa o ajuste manual negativo)

### Colección `app_config`

```json
{ "_id": "starlance", "family_id": "..." }
```

Almacena el ID de la familia creada en el seed inicial. El endpoint `/api/auth/config` lo expone al frontend para que el niño pueda enviar tareas con el `family_id` correcto.

---

## 5. Flujo de autenticación

```
1. LoginPage carga → GET /api/auth/users → obtiene lista de avatares

2. Usuario selecciona avatar → aparece modal de contraseña

3. Usuario ingresa contraseña → POST /api/auth/login (form data: username, password)
   └── Backend: busca usuario en USERS dict → verifica bcrypt → genera JWT 30 días
   └── Respuesta: { access_token, token_type, user: { id, username, display_name, role, avatar } }

4. Frontend guarda en localStorage (recuérdame) o sessionStorage (sesión)
   └── Axios: agrega header Authorization: Bearer <token> a todas las requests

5. Recarga de página → AuthContext lee token de storage → restaura sesión sin nueva llamada de login

6. Logout → elimina token de ambos storages → redirige a /login
```

### Protección de rutas

`ProtectedRoute` envuelve todas las páginas que requieren autenticación. Verifica:
1. Si `loading` es true → muestra spinner (evita redirección prematura antes de que AuthContext cargue)
2. Si no hay `user` → redirige a `/login`
3. Si el `role` no coincide → redirige a la pantalla correcta del rol

---

## 6. Flujo de tareas

### Envío por el niño

```
1. Niño entra a Dashboard → se cargan en paralelo:
   - GET /api/catalog/?active_only=true → catálogo visible
   - GET /api/tasks/?user_id={id}       → tareas ya enviadas
   - GET /api/balance/{id}              → balance actual

2. Niño selecciona tareas (hoy o ayer mediante tabs)
   - Tareas ya enviadas ese día se marcan como deshabilitadas con su estado

3. Niño presiona "Enviar" → para cada tarea seleccionada:
   POST /api/tasks/ con { title, description, points, assigned_to_id,
                          family_id, task_type, task_date, icon, catalog_id }
   └── Backend crea tarea con status = "completed"

4. Frontend recarga datos → tareas enviadas aparecen como "⏳ Pendiente"
```

### Aprobación por el admin

```
1. Admin entra a Dashboard → carga en paralelo tareas de gabriel y daniela:
   GET /api/tasks/?user_id=user_gabriel
   GET /api/tasks/?user_id=user_daniela
   └── Filtra solo status === "completed"

2. Admin presiona "Aprobar":
   PATCH /api/tasks/{id}/approve con { approver_id }
   └── Backend valida que el task esté en "completed"
   └── Backend valida que el approver sea "parent"
   └── Cambia status a "approved"
   └── Llama a balance_service.add_points_for_task() → crea transacción "earn"
   └── Actualiza balance en documento de la familia

3. Admin presiona "Rechazar":
   PATCH /api/tasks/{id}/reject
   └── Cambia status a "rejected" (sin modificar balance)
```

---

## 7. Flujo de recompensas

### Canje por el niño

```
1. Niño entra a Rewards → GET /api/rewards/ → lista de recompensas activas
   └── También carga GET /api/balance/{id} para mostrar estrellas disponibles

2. Niño presiona "Canjear" en una recompensa
   └── Modal de confirmación muestra el costo y el balance resultante

3. Confirma → POST /api/rewards/{id}/redeem con { user_id }
   └── Backend verifica que balance >= costo
   └── Descuenta estrellas → crea transacción "redeem"
   └── Retorna el nuevo balance
```

### Ajuste manual por el admin

```
PATCH /api/balance/{user_id}/adjust con { delta: N }
└── Si delta > 0 → crea transacción "earn" con amount = delta
└── Si delta < 0 → crea transacción "redeem" con amount = abs(delta)
└── Actualiza balance en familia
```

---

## 8. Diseño del frontend

### Tema visual

- **Fondo:** negro azulado (`#0a0a1a`) con 80 estrellas animadas (twinkle) usando CSS custom properties
- **Tipografías:** Exo 2 (headings, display) + Nunito (body) — Google Fonts
- **Colores principales:** púrpura (`#7c3aed`), cian (`#22d3ee`), rosa (`#ec4899`), dorado (`#fbbf24`)
- **Componentes:** cards con borde sutil, botones con glow en hover, badges de estado con color semántico

### Paleta de colores personalizada (Tailwind)

```js
space: { 950, 900, 800, 700, 600 }  // negros azulados
gold:  { 400, 500, 600 }            // dorado para estrellas
// + extensión de purple, pink, cyan con valores específicos
```

### Páginas

| Ruta | Componente | Rol |
|---|---|---|
| `/login` | LoginPage | público |
| `/dashboard` | kid/Dashboard | kid |
| `/stars` | kid/Stars | kid |
| `/rewards` | kid/Rewards | kid |
| `/admin` | admin/Dashboard | admin |
| `/admin/tasks` | admin/TaskCatalog | admin |
| `/admin/rewards` | admin/RewardsManager | admin |
| `/admin/adjust` | admin/AdjustStars | admin |

### LoginPage — selección de avatar

Carga la lista de usuarios desde `/api/auth/users` y muestra 3 cards en grid. Al hacer click en un avatar aparece el modal de contraseña con el campo password, checkbox "Recordarme" y botón de submit. Si el array de usuarios es vacío o la llamada falla, muestra un spinner "Conectando..." en lugar de crashear.

---

## 9. Deploy y CI/CD

### Dockerfile

```dockerfile
FROM python:3.12-slim

# Instala Node.js 20 desde NodeSource
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && apt-get clean

WORKDIR /app

# Dependencias Python (capa cacheada)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Dependencias y build del frontend
COPY frontend/package.json ./frontend/
RUN cd frontend && npm install --legacy-peer-deps
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Backend
COPY app/ ./app/
COPY pytest.ini .

EXPOSE 8000
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1
```

### railway.json

```json
{
  "build": { "builder": "DOCKERFILE", "dockerfilePath": "Dockerfile" },
  "deploy": {
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### Proceso de deploy

Cada `git push` a `main` dispara automáticamente un nuevo build en Railway. Railway detecta el `railway.json`, usa el Dockerfile, construye la imagen (~3 minutos) y hace el healthcheck en `/health`. Si pasa, el tráfico se enruta al nuevo contenedor; si falla, Railway mantiene el deploy anterior.

### Variables de entorno en Railway

```
MONGODB_URL    → connection string completo de MongoDB Atlas
DATABASE_NAME  → starlance
SECRET_KEY     → clave aleatoria para firmar JWT
ENVIRONMENT    → production
PORT           → asignado automáticamente por Railway (no definir manualmente)
```

---

## 10. Historial de bugs resueltos

### Bug 1 — Railway usaba Railpack en lugar de Dockerfile

**Síntoma:** Railway ignoraba el `Dockerfile` y usaba su propio builder (Railpack), que fallaba con "No start command detected".

**Causa:** Railway detecta automáticamente el builder más apropiado. Sin configuración explícita elegía Railpack.

**Solución:** Crear `railway.json` con `"builder": "DOCKERFILE"` para forzar el uso del Dockerfile.

---

### Bug 2 — `pip: command not found` en Nixpacks

**Síntoma:** El build de Nixpacks fallaba con `/bin/bash: pip: command not found`.

**Causa:** El entorno Nix de Railway usa `python3` pero no instala `pip` por defecto, incluso con `python312Full`.

**Solución:** Se descartó Nixpacks completamente y se migró a Dockerfile con la imagen oficial `python:3.12-slim` que incluye pip.

---

### Bug 3 — `passlib` incompatible con `bcrypt 5.x`

**Síntoma:** La app arrancaba pero el login fallaba con `AttributeError: module 'bcrypt' has no attribute '__about__'`.

**Causa:** `passlib 1.7.4` accede a `bcrypt.__about__.__version__` que fue eliminado en bcrypt 5.x.

**Solución:** Se eliminó passlib del proyecto y se usó el paquete `bcrypt` directamente en `security.py`:
```python
import bcrypt
def _hash(p): return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()
def verify(plain, hashed): return bcrypt.checkpw(plain.encode(), hashed.encode())
```

---

### Bug 4 — `python-multipart` no instalado

**Síntoma:** La app crasheaba al arrancar con `RuntimeError: Form data requires "python-multipart"`.

**Causa:** FastAPI requiere `python-multipart` para parsear requests con `Content-Type: application/x-www-form-urlencoded` (usado por `OAuth2PasswordRequestForm`). No estaba en `requirements.txt`.

**Solución:** Agregar `python-multipart>=0.0.9` a `requirements.txt`.

---

### Bug 5 — Rutas API sin prefijo `/api`

**Síntoma:** La app desplegaba correctamente pero la pantalla de login aparecía en blanco. Error en consola: `TypeError: r.map is not a function`.

**Causa:** El frontend usaba `baseURL: '/api'` en Axios, por lo que llamaba a `/api/auth/users`. El backend registraba las rutas como `/auth/users` (sin `/api`). La ruta inexistente caía en el catch-all SPA que devolvía `index.html` (HTML, no JSON). Axios retornaba el HTML como string, y `setUsers(htmlString)` hacía que `users.map()` lanzara TypeError al renderizar.

**Solución:** Agregar `prefix="/api"` a todos los `app.include_router()` en `main.py`:
```python
app.include_router(auth_router.router, prefix="/api")
app.include_router(catalog_router.router, prefix="/api")
# ...
```

---

### Bug 6 — `_id` vs `id` en respuestas JSON

**Síntoma:** Las operaciones de editar y eliminar en el catálogo de tareas no respondían. Sin error visible en la pantalla.

**Causa:** Los helpers de repositorio devolvían `"_id"` como clave del dict, y Pydantic v2 con FastAPI serializaba la respuesta usando el alias `_id`. El frontend recibía `{ "_id": "abc", ... }` pero usaba `t.id` y `modal.id` → `undefined` → URL resultante `/catalog/undefined` → 404 silencioso.

**Solución:** Cambiar todos los helpers de repositorio para devolver `"id"` en lugar de `"_id"`, y eliminar el `Field(alias="_id")` de todos los schemas de respuesta:
```python
# Antes
"_id": str(doc["_id"])
id: str = Field(..., alias="_id")

# Después
"id": str(doc["_id"])
id: str
```

Afectaba a: `catalog_repository`, `task_repository`, `reward_repository`, `family_repository` y sus schemas correspondientes.

---

### Bug 7 — Tareas enviadas no aparecían en el panel del admin

**Síntoma:** Los niños enviaban tareas exitosamente (UI confirmaba "¡4 tareas enviadas! Esperando aprobación 🎉"), pero el panel del admin mostraba "Todo al día" sin ninguna tarea pendiente.

**Causas (doble bug):**

1. `create_task` guardaba las tareas con `status = "pending"`, pero el admin filtraba por `status === "completed"`. Las tareas nunca aparecían en el filtro.

2. `_task_helper` no incluía los campos `task_date`, `icon` ni `catalog_id` en el dict retornado. Esto causaba que:
   - El filtro de "tareas ya enviadas hoy" (`t.task_date === activeDate`) nunca coincidiera → los niños podían re-enviar las mismas tareas
   - Los íconos de tareas enviadas mostraban el fallback `⭐` en lugar del ícono real

**Solución:**
```python
# task_repository.py — create_task
task_dict["status"] = TaskStatus.completed  # era TaskStatus.pending

# task_repository.py — _task_helper
"task_date": task.get("task_date"),
"icon": task.get("icon", "⭐"),
"catalog_id": task.get("catalog_id"),
```

---

### Bug 8 — Cache del navegador mostraba bundle antiguo

**Síntoma:** Después de un nuevo deploy, la página seguía mostrando el comportamiento antiguo (pantalla en blanco o errores ya corregidos).

**Causa:** El navegador tenía en caché el bundle JavaScript (`index-DYOPITuQ.js`). Vite genera nombres de archivo con hash basado en el contenido; si el contenido no cambia, el hash es el mismo y el navegador sirve la versión cacheada.

**Solución:** Hard refresh con `Ctrl + Shift + R` (o `Ctrl + F5`) para forzar recarga sin caché. En el siguiente deploy con cambios de frontend, Vite genera un nuevo hash y el navegador descarga el nuevo bundle automáticamente.

---

## 11. Decisiones descartadas

### GitHub Pages

Se evaluó GitHub Pages para el frontend, pero fue descartado porque:
- GitHub Pages solo sirve archivos estáticos — no puede ejecutar Python/FastAPI
- Habría requerido dos deployments separados (Pages para el frontend, Heroku/Render para la API)
- CORS complejo entre dos dominios distintos
- La combinación Railway (monorepo) resultó en una sola URL, más simple

### Nixpacks (builder de Railway)

Se intentó configurar `nixpacks.toml` para el build, pero fue descartado por:
- El entorno Nix no incluye pip aunque se especifique `python312Full`
- La documentación de Railway sobre Nixpacks con Python es escasa
- El Dockerfile con `python:3.12-slim` es más predecible y portable

### `passlib` para hashing

Se intentó usar `passlib` (la librería clásica de FastAPI para passwords) pero fue descartado porque:
- `passlib 1.7.4` es incompatible con `bcrypt 5.x`
- El mantenimiento de passlib está prácticamente abandonado
- Usar `bcrypt` directamente es más simple y sin dependencias extra

### Registro dinámico de usuarios

Se consideró una colección `users` en MongoDB con registro/login dinámico, pero fue descartado porque:
- La app es para uso familiar privado con exactamente 3 usuarios fijos
- El overhead de registro, reseteo de contraseña, etc. no aporta valor
- Los usuarios hardcodeados en `security.py` son más seguros para este caso (no hay superficie de ataque de registro)

---

*Documento generado el 13 de Junio de 2026 — StarLance Alpha v1.0*
