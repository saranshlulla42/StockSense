from routers import (
    auth_router,
    dashboard_router,
    inventory_router,
    moves_router,
    operations_router,
    products_router,
    settings_router,
)
import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))


app = FastAPI(title="StockSense API", version="0.1.0")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router_module in (
    auth_router,
    dashboard_router,
    operations_router,
    products_router,
    inventory_router,
    moves_router,
    settings_router,
):
    app.include_router(router_module.router, prefix="/api/v1")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
