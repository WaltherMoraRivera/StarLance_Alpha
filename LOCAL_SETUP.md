# Guía de Ejecución Local - StarLance API

## 📋 Requisitos Previos

- **Python 3.14.0** o superior
- **pip** (gestor de paquetes de Python)
- **Git** (opcional, para clonar el repositorio)

## 🚀 Pasos para Ejecutar la API Localmente

### 1. Preparar el Entorno Virtual

#### Windows (PowerShell):
```powershell
# Crear el entorno virtual
python -m venv .venv

# Activar el entorno virtual
.\.venv\Scripts\Activate.ps1

# Si tienes restricciones de ejecución, ejecuta primero:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
```

#### macOS/Linux (Bash):
```bash
# Crear el entorno virtual
python3 -m venv .venv

# Activar el entorno virtual
source .venv/bin/activate
```

### 2. Instalar Dependencias

```bash
# Actualizar pip (recomendado)
pip install --upgrade pip

# Instalar todas las dependencias del proyecto
pip install -r requirements.txt
```

**Paquetes principales instalados:**
- fastapi 0.104.1 - Framework web asincrónico
- uvicorn 0.23.0+ - Servidor ASGI
- motor 3.7.0 - Driver async para MongoDB
- pydantic 2.0.0 - Validación de datos
- pytest 9.0.3 - Testing
- mongomock-motor 0.0.36 - Mock de MongoDB para tests

### 3. Configurar Variables de Entorno (Opcional)

Crea un archivo `.env` en la raíz del proyecto:

```env
# Configuración de MongoDB
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=starlance_db

# Configuración de la API
API_HOST=0.0.0.0
API_PORT=8000
ENVIRONMENT=development
```

**Nota:** Si no tienes MongoDB instalado localmente, los tests usarán `mongomock-motor` automáticamente.

### 4. Iniciar el Servidor

```bash
# Con recarga automática (desarrollo)
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Sin recarga automática (producción)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Salida esperada:**
```
INFO:     Will watch for changes in these directories: ['C:\Users\Walther\Desktop\...\Proyecto_StarLance']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [14264] using WatchFiles
INFO:     Started server process [4288]
INFO:     Application startup complete.
```

## 📖 Acceso a la Documentación Interactiva

Una vez que el servidor esté corriendo, accede a:

### Swagger UI (Recomendado)
```
http://localhost:8000/docs
```

### ReDoc (Alternativa)
```
http://localhost:8000/redoc
```

### OpenAPI JSON Schema
```
http://localhost:8000/openapi.json
```

## 🧪 Ejecutar Tests

### Tests Completos
```bash
python -m pytest -v
```

### Tests Específicos
```bash
# Tests de familias
python -m pytest app/tests/test_families.py -v

# Tests de tareas
python -m pytest app/tests/test_tasks.py -v

# Tests de recompensas
python -m pytest app/tests/test_rewards.py -v
```

### Con Cobertura
```bash
python -m pytest --cov=app --cov-report=html
```

**Resultado esperado:** ✅ 18/18 tests pasando

## 🔌 Endpoints Disponibles

### Familias
```
POST   /families/              - Crear familia
GET    /families/              - Obtener todas las familias
GET    /families/{id}          - Obtener familia por ID
PUT    /families/{id}          - Actualizar familia
DELETE /families/{id}          - Eliminar familia
```

### Tareas
```
POST   /tasks/                 - Crear tarea
GET    /tasks/{id}             - Obtener tarea por ID
GET    /tasks/user/{user_id}   - Obtener tareas del usuario
PATCH  /tasks/{id}/complete    - Marcar tarea como completada
PATCH  /tasks/{id}/approve     - Aprobar tarea completada
DELETE /tasks/{id}             - Eliminar tarea
```

### Recompensas
```
POST   /rewards/               - Crear recompensa
GET    /rewards/{id}           - Obtener recompensa por ID
GET    /rewards/               - Obtener recompensas por familia
POST   /rewards/redeem         - Canjear recompensa
DELETE /rewards/{id}           - Eliminar recompensa
```

### Balance y Transacciones
```
GET    /balance/{user_id}      - Obtener balance del usuario
GET    /transactions/{user_id} - Obtener transacciones del usuario
```

## 📝 Ejemplo de Requests con cURL

### Crear una Familia
```bash
curl -X POST "http://localhost:8000/families/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Familia",
    "members": [
      {
        "id": "child_001",
        "name": "Juan",
        "role": "child",
        "balance": 100
      },
      {
        "id": "parent_001",
        "name": "María",
        "role": "parent",
        "balance": 0
      }
    ]
  }'
```

### Crear una Tarea
```bash
curl -X POST "http://localhost:8000/tasks/" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Limpiar el cuarto",
    "description": "Ordenar y limpiar el cuarto",
    "assigned_to": "child_001",
    "family_id": "<FAMILY_ID>",
    "points": 50,
    "status": "pending"
  }'
```

### Crear una Recompensa
```bash
curl -X POST "http://localhost:8000/rewards/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Película en cine",
    "cost": 150,
    "family_id": "<FAMILY_ID>"
  }'
```

### Obtener Balance
```bash
curl -X GET "http://localhost:8000/balance/child_001"
```

## 🛠️ Troubleshooting

### Error: "ModuleNotFoundError: No module named 'app'"
**Solución:** Asegúrate de estar en el directorio raíz del proyecto y el entorno virtual esté activado.

### Error: "RuntimeError: Event loop is closed"
**Solución:** El proyecto usa `mongomock-motor` para tests. Si necesitas MongoDB real, instálalo y actualiza `MONGODB_URL` en `.env`.

### Error: "Address already in use"
**Solución:** El puerto 8000 está ocupado. Usa otro puerto:
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### Tests Fallando
**Solución:** Asegúrate de tener `mongomock-motor` instalado:
```bash
pip install mongomock-motor>=0.0.36
```

## 📊 Estructura del Proyecto

```
Proyecto_StarLance/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Punto de entrada de la aplicación
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py          # Configuración de la app
│   ├── db/
│   │   ├── __init__.py
│   │   └── mongodb.py         # Conexión a MongoDB
│   ├── repositories/          # Capa de acceso a datos
│   ├── services/              # Lógica de negocio
│   ├── routers/               # Endpoints de la API
│   ├── schemas/               # Modelos Pydantic
│   └── tests/                 # Tests unitarios e integrales
├── requirements.txt           # Dependencias del proyecto
├── pytest.ini                 # Configuración de pytest
├── README.md                  # Documentación general
└── PROJECT_STATUS.md          # Estado del proyecto
```

## 🔄 Workflow de Desarrollo

1. **Activate el entorno virtual:**
   ```bash
   .\.venv\Scripts\Activate.ps1  # Windows
   source .venv/bin/activate      # macOS/Linux
   ```

2. **Haga cambios en el código** (el servidor recarga automáticamente)

3. **Ejecute los tests:**
   ```bash
   python -m pytest -v
   ```

4. **Pruebe manualmente en Swagger:**
   - Acceda a `http://localhost:8000/docs`
   - Use la interfaz interactiva para probar endpoints

5. **Revise los cambios:**
   - Verifique que todos los tests pasen
   - Valide en la documentación Swagger

## 📞 Contacto y Soporte

Para más información, revise:
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Estado del proyecto
- [README.md](README.md) - Documentación general
- Código fuente en `app/`

---

**Última actualización:** 29 de Abril de 2026
**Versión Python:** 3.14.0
**Versión FastAPI:** 0.104.1
