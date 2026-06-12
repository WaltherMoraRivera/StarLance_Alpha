# 🚀 StarLance API

API REST para gestión de tareas domésticas gamificadas con sistema de recompensas familiares.

**Estado:** ✅ **100% Funcional** - Todos los 18 tests integrales pasando

## 🧱 Stack Tecnológico

| Componente | Versión | Propósito |
|---|---|---|
| **FastAPI** | 0.104.1 | Framework web asincrónico |
| **Python** | 3.14.0 | Runtime |
| **Pydantic** | 2.13.3 | Validación de datos |
| **Motor** | 3.7.1 | Driver async para MongoDB |
| **mongomock-motor** | 0.0.36 | Mock de MongoDB para testing |
| **pytest** | 9.0.3 | Framework de testing |
| **httpx** | 0.28.1 | Cliente HTTP async |
| **Uvicorn** | 0.46.0 | Servidor ASGI |

## 📋 Requisitos

- Python 3.14.0+
- pip (gestor de paquetes)
- MongoDB (opcional - tests usan mock local)

## ⚙️ Setup Rápido

### 1. Clonar y Preparar
```bash
git clone https://github.com/WaltherMoraRivera/starlance-api.git
cd starlance-api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\Activate.ps1
```

### 2. Instalar Dependencias
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Configurar Variables de Entorno (Opcional)
```bash
cp .env.example .env  # Si existe
# Editar .env con tu configuración
```

## ▶️ Ejecutar la API

### Modo Desarrollo (con recarga automática)
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Modo Producción
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Acceso local:** `http://localhost:8000`

## 📘 Documentación Interactiva

Una vez que el servidor esté corriendo:

- **Swagger UI:** http://localhost:8000/docs (Recomendado)
- **ReDoc:** http://localhost:8000/redoc
- **OpenAPI Schema:** http://localhost:8000/openapi.json

Para más detalles sobre configuración local, consulta [LOCAL_SETUP.md](LOCAL_SETUP.md).

## 🧪 Tests

### Ejecutar Todos los Tests
```bash
python -m pytest -v
```

**Resultado esperado:** ✅ **18/18 tests pasando** (100% cobertura de flujos principales)

### Tests Específicos
```bash
# Familias (CRUD)
python -m pytest app/tests/test_families.py -v

# Tareas (crear, completar, aprobar)
python -m pytest app/tests/test_tasks.py -v

# Recompensas (crear, canjear, validar balance)
python -m pytest app/tests/test_rewards.py -v
```

### Con Cobertura
```bash
python -m pytest --cov=app --cov-report=html
```

## 🏗️ Arquitectura

La aplicación sigue un patrón en capas limpio:

```
HTTP Request
     ↓
   Routers (Validación de entrada)
     ↓
  Services (Lógica de negocio)
     ↓
Repositories (Acceso a datos)
     ↓
  MongoDB
```

### Estructura de Directorios
```
app/
├── main.py                    # Punto de entrada
├── core/
│   └── config.py            # Configuración
├── db/
│   └── mongodb.py           # Conexión a BD
├── repositories/            # Capa de datos
│   ├── family_repository.py
│   ├── task_repository.py
│   ├── reward_repository.py
│   └── transaction_repository.py
├── services/                # Lógica de negocio
│   ├── balance_service.py
│   ├── reward_service.py
│   └── task_service.py
├── routers/                 # Endpoints
│   ├── family_router.py
│   ├── task_router.py
│   ├── reward_router.py
│   └── balance_router.py
├── schemas/                 # Modelos Pydantic
│   ├── family.py
│   ├── task.py
│   ├── reward.py
│   └── transaction.py
└── tests/                   # Tests
    ├── conftest.py
    ├── test_families.py
    ├── test_tasks.py
    └── test_rewards.py
```

## 🔌 Endpoints Principales

### Familias
```
POST   /families/              - Crear familia
GET    /families/              - Obtener todas las familias
GET    /families/{id}          - Obtener por ID
PUT    /families/{id}          - Actualizar
DELETE /families/{id}          - Eliminar
```

### Tareas
```
POST   /tasks/                 - Crear tarea
GET    /tasks/{id}             - Obtener por ID
GET    /tasks/user/{user_id}   - Obtener por usuario
PATCH  /tasks/{id}/complete    - Marcar completada
PATCH  /tasks/{id}/approve     - Aprobar tarea
DELETE /tasks/{id}             - Eliminar
```

### Recompensas
```
POST   /rewards/               - Crear recompensa
GET    /rewards/{id}           - Obtener por ID
GET    /rewards/?family_id=... - Obtener por familia
POST   /rewards/redeem         - Canjear recompensa
DELETE /rewards/{id}           - Eliminar
```

### Balance y Transacciones
```
GET    /balance/{user_id}      - Obtener balance
GET    /transactions/{user_id} - Obtener transacciones
```

## 💾 Base de Datos

### Colecciones MongoDB
- **families** - Información de familias y miembros
- **tasks** - Tareas domésticas asignadas
- **rewards** - Recompensas disponibles
- **transactions** - Historial de puntos

### Mapeo de Campos
MongoDB `_id` se mapea automáticamente a través de Pydantic aliases:
```python
class Response(BaseModel):
    id: str = Field(..., alias="_id")  # Mapea _id ← → id
```

## 🔍 Testing con mongomock-motor

Los tests usan **mongomock-motor** (v0.0.36) para proporcionar una implementación local de MongoDB sin requerir un servidor real. Esto permite:

✅ Tests rápidos y locales  
✅ CI/CD sin dependencias externas  
✅ Desarrollo sin MongoDB instalado  
✅ Aislamiento entre tests

## 📊 Estado del Proyecto

Consulta [PROJECT_STATUS.md](PROJECT_STATUS.md) para:
- Tareas completadas
- Problemas resueltos
- Stack tecnológico detallado
- Próximos pasos sugeridos

## 🚀 Próximos Pasos

### Nuevas Funcionalidades
- [ ] Autenticación JWT
- [ ] Control de acceso basado en roles (RBAC)
- [ ] Notificaciones en tiempo real
- [ ] Integración móvil
- [ ] Gamificación avanzada (insignias, niveles)

### Infraestructura
- [ ] CI/CD con GitHub Actions
- [ ] Logging estructurado
- [ ] Monitoring (Prometheus/Grafana)
- [ ] Caching con Redis
- [ ] Índices de BD optimizados

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## ⚠️ Troubleshooting

### "ModuleNotFoundError: No module named 'app'"
Asegúrate de estar en el directorio raíz del proyecto con el entorno virtual activado.

### "Address already in use"
El puerto 8000 está ocupado. Usa: `--port 8001`

### Tests fallando
Instala mongomock-motor: `pip install mongomock-motor>=0.0.36`

Para más soluciones, consulta [LOCAL_SETUP.md](LOCAL_SETUP.md#-troubleshooting).

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 📞 Contacto

Para preguntas o sugerencias, abre un issue en GitHub o contacta al equipo de desarrollo.

---

**Última actualización:** 29 de Abril de 2026  
**Versión:** 1.0.0  
**Estado de Tests:** ✅ 18/18 Pasando
