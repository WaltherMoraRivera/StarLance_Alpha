# StarLance Alpha — Patch Log

---

## v1.01 — 2026-06-12

### Cambios
- **Favicon personalizado:** Se añadió `Icon_StarLance_Alpha.png` como ícono de la aplicación (`frontend/public/favicon.png`). Aparece en pestañas del navegador, marcadores, pantalla de inicio en móvil y miniaturas del sistema operativo.
- **index.html actualizado:** Reemplazado el `<link rel="icon">` anterior (SVG placeholder `star.svg`) por la nueva imagen PNG.

### Archivos modificados
| Archivo | Cambio |
|---|---|
| `frontend/public/favicon.png` | Nuevo — ícono oficial de la app |
| `frontend/index.html` | `href="/star.svg"` → `href="/favicon.png"`, `type="image/png"` |

---

## v1.0 — 2026-06-12

### Lanzamiento inicial en producción

**URL:** https://starlancealpha-production.up.railway.app

#### Funcionalidades incluidas
- Login con avatares estilo Netflix (Gabriel, Daniela, Admin)
- Dashboard de niños: seleccionar tareas completadas por día
- Dashboard de admin: aprobar / rechazar tareas enviadas
- Catálogo de tareas CRUD completo
- Catálogo de recompensas CRUD completo
- Sistema de estrellas: acumulación por aprobación, canje por recompensas
- Ajuste manual de estrellas por admin
- Historial de transacciones por usuario

#### Stack
- Backend: FastAPI + Python 3.12 + MongoDB Atlas (Motor async)
- Frontend: React 18 + Vite + Tailwind CSS
- Deploy: Railway (Docker)

#### Bugs resueltos antes del lanzamiento
1. Railway healthcheck fallaba por crash en `init_app_data()` si MongoDB no respondía
2. `python-multipart` faltaba en `requirements.txt` — crash en login
3. Página en blanco por `TypeError: r.map is not a function` — frontend llamaba `/api/...` pero backend no tenía prefijo `/api`
4. Pantalla "Conectando..." infinita — caché del navegador con bundle viejo
5. CRUD del catálogo (editar/eliminar) silenciaban 404 — repositories retornaban `_id` en lugar de `id`
6. Tareas enviadas por niños no llegaban al admin — status inicial era `pending` en vez de `completed`
