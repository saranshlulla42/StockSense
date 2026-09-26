from fastapi import FastAPI

from backend.routers import (
    auth_router,
    dashboard_router,
    inventory_router,
    moves_router,
    operations_router,
    products_router,
    settings_router,
)

app = FastAPI(title="StockSense API", version="0.1.0")

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
