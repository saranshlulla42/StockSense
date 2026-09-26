-- =====================================================================
-- StockSense — Production SQLite / PostgreSQL Schema
-- =====================================================================

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    login_id        TEXT NOT NULL UNIQUE,   -- 6–12 alphanumeric characters
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    full_name       TEXT NOT NULL,
    role            TEXT NOT NULL DEFAULT 'inventory_manager'
                    CHECK (role IN ('inventory_manager', 'warehouse_staff')),
    is_active       BOOLEAN NOT NULL DEFAULT 1,
    is_verified     BOOLEAN NOT NULL DEFAULT 0,
    otp_code        TEXT,
    otp_expires_at  TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_login_id ON users(login_id);
CREATE INDEX idx_users_email ON users(email);

-- ---------------------------------------------------------------------
-- warehouses
-- ---------------------------------------------------------------------
CREATE TABLE warehouses (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    short_code      TEXT NOT NULL UNIQUE,
    address         TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT 1,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_warehouses_short_code ON warehouses(short_code);

-- ---------------------------------------------------------------------
-- locations
-- ---------------------------------------------------------------------
CREATE TABLE locations (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    warehouse_id    INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    name            TEXT NOT NULL,
    short_code      TEXT NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT 1,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (warehouse_id, short_code)
);

CREATE INDEX idx_locations_warehouse ON locations(warehouse_id);

-- ---------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------
CREATE TABLE products (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    sku                 TEXT NOT NULL UNIQUE,
    name                TEXT NOT NULL,
    category            TEXT,
    unit_of_measure     TEXT NOT NULL DEFAULT 'unit',
    per_unit_cost       REAL NOT NULL DEFAULT 0 CHECK (per_unit_cost >= 0),
    reorder_level       REAL NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
    avg_daily_usage     REAL NOT NULL DEFAULT 0 CHECK (avg_daily_usage >= 0),
    lead_time_days      INTEGER NOT NULL DEFAULT 0 CHECK (lead_time_days >= 0),
    is_active           BOOLEAN NOT NULL DEFAULT 1,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);

-- ---------------------------------------------------------------------
-- inventory (location-level stock)
-- ---------------------------------------------------------------------
CREATE TABLE inventory (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id          INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    location_id         INTEGER NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    quantity            REAL NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reserved_quantity   REAL NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (product_id, location_id)
);

CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_location ON inventory(location_id);

-- ---------------------------------------------------------------------
-- operations
-- ---------------------------------------------------------------------
CREATE TABLE operations (
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,
    reference                   TEXT NOT NULL UNIQUE,
    type                        TEXT NOT NULL
                                CHECK (type IN ('receipt', 'delivery', 'transfer', 'adjustment')),
    status                      TEXT NOT NULL DEFAULT 'draft'
                                CHECK (status IN ('draft', 'waiting', 'ready', 'done', 'cancelled')),
    contact_name                TEXT,
    schedule_date               DATE,
    warehouse_id                INTEGER REFERENCES warehouses(id),
    responsible_id              INTEGER REFERENCES users(id),
    source_location_id          INTEGER REFERENCES locations(id),
    destination_location_id     INTEGER REFERENCES locations(id),
    delivery_address            TEXT,
    adjustment_reason           TEXT,
    created_at                  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    validated_at                TIMESTAMP
);

CREATE INDEX idx_operations_reference ON operations(reference);
CREATE INDEX idx_operations_type ON operations(type);
CREATE INDEX idx_operations_status ON operations(status);
CREATE INDEX idx_operations_schedule_date ON operations(schedule_date);
CREATE INDEX idx_operations_warehouse ON operations(warehouse_id);

-- ---------------------------------------------------------------------
-- operation_lines
-- ---------------------------------------------------------------------
CREATE TABLE operation_lines (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    operation_id        INTEGER NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
    product_id          INTEGER NOT NULL REFERENCES products(id),
    quantity            REAL NOT NULL CHECK (quantity > 0),
    counted_quantity    REAL,
    is_out_of_stock     BOOLEAN NOT NULL DEFAULT 0
);

CREATE INDEX idx_operation_lines_operation ON operation_lines(operation_id);
CREATE INDEX idx_operation_lines_product ON operation_lines(product_id);

-- ---------------------------------------------------------------------
-- move_history (immutable ledger)
-- ---------------------------------------------------------------------
CREATE TABLE move_history (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    operation_id        INTEGER REFERENCES operations(id),
    operation_line_id   INTEGER REFERENCES operation_lines(id),
    reference           TEXT NOT NULL,
    move_type           TEXT NOT NULL
                        CHECK (move_type IN ('in', 'out', 'transfer', 'adjustment')),
    product_id          INTEGER NOT NULL REFERENCES products(id),
    quantity            REAL NOT NULL,
    from_location_id    INTEGER REFERENCES locations(id),
    to_location_id      INTEGER REFERENCES locations(id),
    contact_name        TEXT,
    reason              TEXT,
    date                TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_move_history_date ON move_history(date);
CREATE INDEX idx_move_history_product ON move_history(product_id);
CREATE INDEX idx_move_history_operation ON move_history(operation_id);
CREATE INDEX idx_move_history_from_loc ON move_history(from_location_id);
CREATE INDEX idx_move_history_to_loc ON move_history(to_location_id);

-- ---------------------------------------------------------------------
-- reference_counters
-- ---------------------------------------------------------------------
CREATE TABLE reference_counters (
    prefix          TEXT PRIMARY KEY,
    next_value      INTEGER NOT NULL DEFAULT 1
);
