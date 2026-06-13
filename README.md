# ⭐ StarLance Alpha

Sistema gamificado de gestión de tareas del hogar para familias. Los niños seleccionan las tareas que completaron cada día, ganan estrellas cuando el admin las aprueba, y pueden canjear sus estrellas por recompensas.

**Estado:** ✅ **v1.0 en producción**
**URL:** [starlancealpha-production.up.railway.app](https://starlancealpha-production.up.railway.app)

---

## ✨ Funcionalidades

### Para los niños (Gabriel y Daniela)
- Login con avatar estilo Netflix + contraseña
- Seleccionar tareas completadas (hoy y ayer)
- Ver estrellas acumuladas e historial completo
- Canjear estrellas por recompensas

### Para el admin (papá/mamá)
- Aprobar o rechazar tareas enviadas por los niños
- Gestionar el catálogo de tareas (crear, editar, activar/desactivar, eliminar)
- Gestionar el catálogo de recompensas
- Ajustar estrellas manualmente a cada niño
- Ver el balance de estrellas en tiempo real

---

## 🧱 Stack

| Capa | Tecnología |
|---|---|
| **Backend** | FastAPI + Python 3.12 |
| **Base de datos** | MongoDB Atlas (Motor async) |
| **Autenticación** | JWT (python-jose) + bcrypt |
| **Frontend** | React 18 + Vite + Tailwind CSS |
| **Deploy** | Railway (Docker) |

---

## 🚀 Setup local

### Requisitos
- Python 3.12+
- Node.js 20+
- MongoDB local o Atlas

### 1. Clonar
```bash
git clone https://github.com/WaltherMoraRivera/StarLance_Alpha.git
cd StarLance_Alpha
```

### 2. Backend
```bash
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
```

### 3. Frontend
```bash
cd frontend
npm install --legacy-peer-deps
cd ..
```

### 4. Variables de entorno
Crea un archivo `.env` en la raíz:
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=starlance
SECRET_KEY=tu-clave-secreta-aqui
ENVIRONMENT=development
```

### 5. Ejecutar
```bash
# Terminal 1 — Backend
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Abre `http://localhost:5173` en el navegador.

---

## 👤 Usuarios por defecto

| Usuario | Contraseña | Rol |
|---|---|---|
| admin | admin2026 | Admin (padre) |
| gabriel | gabriel2026 | Niño |
| daniela | daniela2026 | Niña |

---

## 📁 Estructura del proyecto

```
StarLance_Alpha/
├── app/                        # Backend FastAPI
│   ├── main.py                 # Punto de entrada, routers, SPA serving
│   ├── core/
│   │   ├── config.py           # Configuración (Settings con pydantic-settings)
│   │   └── security.py         # JWT + bcrypt, usuarios hardcodeados
│   ├── db/
│   │   ├── mongodb.py          # Conexión Motor async
│   │   └── init_data.py        # Seed inicial: familia + catálogo de tareas
│   ├── routers/                # Endpoints API (prefijo /api)
│   │   ├── auth_router.py
│   │   ├── catalog_router.py
│   │   ├── task_router.py
│   │   ├── reward_router.py
│   │   ├── balance_router.py
│   │   └── family_router.py
│   ├── services/               # Lógica de negocio
│   │   ├── task_service.py
│   │   ├── reward_service.py
│   │   └── balance_service.py
│   ├── repositories/           # Acceso a datos MongoDB
│   │   ├── task_repository.py
│   │   ├── catalog_repository.py
│   │   ├── reward_repository.py
│   │   ├── family_repository.py
│   │   └── transaction_repository.py
│   └── schemas/                # Modelos Pydantic
│       ├── task.py
│       ├── catalog.py
│       ├── reward.py
│       ├── family.py
│       └── transaction.py
├── frontend/                   # Frontend React
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx             # Rutas React Router
│   │   ├── index.css           # Tailwind + estilos globales
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Estado global de auth
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Starfield.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── kid/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Stars.jsx
│   │   │   │   └── Rewards.jsx
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── TaskCatalog.jsx
│   │   │       ├── RewardsManager.jsx
│   │   │       └── AdjustStars.jsx
│   │   └── services/
│   │       └── api.js          # Axios con baseURL /api
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── Dockerfile                  # Build multi-etapa (Python + Node)
├── railway.json                # Configuración Railway (Dockerfile builder)
├── requirements.txt
└── .env.example
```

---

## 🔌 API Endpoints

Todos los endpoints tienen prefijo `/api`.

```
GET  /health                        Estado del servidor

POST /api/auth/login                Login (form data: username, password)
GET  /api/auth/me                   Usuario actual (requiere JWT)
GET  /api/auth/users                Lista de usuarios (avatares)
GET  /api/auth/config               family_id de la app

GET  /api/catalog/                  Listar catálogo de tareas
POST /api/catalog/                  Crear tarea en catálogo
PATCH /api/catalog/{id}             Editar tarea
DELETE /api/catalog/{id}            Eliminar tarea

GET  /api/tasks/?user_id={id}       Tareas por usuario
POST /api/tasks/                    Enviar tarea completada
PATCH /api/tasks/{id}/approve       Aprobar tarea
PATCH /api/tasks/{id}/reject        Rechazar tarea

GET  /api/rewards/                  Listar recompensas
POST /api/rewards/                  Crear recompensa
PATCH /api/rewards/{id}             Editar recompensa
DELETE /api/rewards/{id}            Eliminar recompensa
POST /api/rewards/{id}/redeem       Canjear recompensa

GET  /api/balance/{user_id}         Balance de estrellas
GET  /api/balance/{user_id}/history Historial de transacciones
POST /api/balance/{user_id}/adjust  Ajuste manual de estrellas (admin)

GET  /api/families/{id}             Info de la familia
```

---

## 🐳 Deploy en Railway

El proyecto usa un `Dockerfile` que:
1. Instala Node.js 20 sobre `python:3.12-slim`
2. Instala dependencias Python (`pip install`)
3. Instala dependencias Node (`npm install`)
4. Buildea el frontend (`npm run build`)
5. Copia el backend
6. Arranca `uvicorn` que sirve la API **y** el frontend estático

Variables de entorno requeridas en Railway:
```
MONGODB_URL    = mongodb+srv://...@cluster.mongodb.net/...
DATABASE_NAME  = starlance
SECRET_KEY     = (string aleatorio seguro)
ENVIRONMENT    = production
```

---

## 📄 Documentación técnica

Ver [DOCUMENTACION.md](DOCUMENTACION.md) para el historial completo de desarrollo, decisiones de arquitectura y bugs resueltos.

---

**Versión:** 1.0.0 · **Fecha:** Junio 2026 · **Familia Mora Rivera**
