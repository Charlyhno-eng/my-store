CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    label VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE items (
    id BIGSERIAL PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    category_id BIGINT NOT NULL,
    CONSTRAINT fk_items_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE stocks (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL UNIQUE,
    number INTEGER NOT NULL CHECK (number >= 0),
    CONSTRAINT fk_stocks_item
        FOREIGN KEY (item_id)
        REFERENCES items(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL,
    number INTEGER NOT NULL CHECK (number > 0),
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    ordered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_item
        FOREIGN KEY (item_id)
        REFERENCES items(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);
