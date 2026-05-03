package service

import (
	"database/sql"
	"fmt"
)


type CategoryDTO struct {
	ID    int64  `json:"id"`
	Label string `json:"label"`
}

type ItemWithStockDTO struct {
	ID         int64   `json:"id"`
	Label      string  `json:"label"`
	CategoryID int64   `json:"categoryId"`
	ImagePath  string  `json:"imagePath"`
	Quantity   int64   `json:"quantity"` // -1 if no stock entries
}

type StockDTO struct {
	ID       int64 `json:"id"`
	ItemID   int64 `json:"itemId"`
	Quantity int64 `json:"quantity"`
}

type StockService struct {
	db *sql.DB
}


// NewStockService creates a new StockService instance
// with a given database connection.
func NewStockService(db *sql.DB) *StockService {
	return &StockService{db: db}
}

// GetCategories returns all categories sorted alphabetically.
func (s *StockService) GetCategories() ([]CategoryDTO, error) {
	if s.db == nil {
		return nil, fmt.Errorf("database is not initialized")
	}

	rows, err := s.db.Query(`
		SELECT id, label
		FROM categories
		ORDER BY label ASC
	`)
	if err != nil {
		return nil, fmt.Errorf("query categories: %w", err)
	}
	defer rows.Close()

	var categories []CategoryDTO
	for rows.Next() {
		var c CategoryDTO
		if err := rows.Scan(&c.ID, &c.Label); err != nil {
			return nil, fmt.Errorf("scan category: %w", err)
		}
		categories = append(categories, c)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate categories: %w", err)
	}

	return categories, nil
}

// CreateCategory creates a new category and returns its ID.
func (s *StockService) CreateCategory(label string) (int64, error) {
	if s.db == nil {
		return 0, fmt.Errorf("database is not initialized")
	}
	if label == "" {
		return 0, fmt.Errorf("label must not be empty")
	}

	result, err := s.db.Exec(`INSERT INTO categories (label) VALUES (?)`, label)
	if err != nil {
		return 0, fmt.Errorf("insert category: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("last insert id (category): %w", err)
	}

	return id, nil
}

// UpdateCategory updates the label of an existing category.
func (s *StockService) UpdateCategory(id int64, label string) error {
	if s.db == nil {
		return fmt.Errorf("database is not initialized")
	}
	if label == "" {
		return fmt.Errorf("label must not be empty")
	}

	result, err := s.db.Exec(`UPDATE categories SET label = ? WHERE id = ?`, label, id)
	if err != nil {
		return fmt.Errorf("update category: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("rows affected (update category): %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("category %d not found", id)
	}

	return nil
}

// DeleteCategory deletes a category.
// Fails if items are still attached to it (ON DELETE RESTRICT in the database).
func (s *StockService) DeleteCategory(id int64) error {
	if s.db == nil {
		return fmt.Errorf("database is not initialized")
	}

	result, err := s.db.Exec(`DELETE FROM categories WHERE id = ?`, id)
	if err != nil {
		return fmt.Errorf("delete category: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("rows affected (delete category): %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("category %d not found", id)
	}

	return nil
}

// GetItems returns all items with their current stock.
// If an item has no entry in the stocks table, Quantity is -1.
func (s *StockService) GetItems() ([]ItemWithStockDTO, error) {
	if s.db == nil {
		return nil, fmt.Errorf("database is not initialized")
	}

	rows, err := s.db.Query(`
		SELECT
			i.id,
			i.label,
			i.category_id,
			COALESCE(i.image_path, ''),
			COALESCE(st.quantity, -1)
		FROM items i
		LEFT JOIN stocks st ON st.item_id = i.id
		ORDER BY i.label ASC
	`)
	if err != nil {
		return nil, fmt.Errorf("query items: %w", err)
	}
	defer rows.Close()

	var items []ItemWithStockDTO
	for rows.Next() {
		var it ItemWithStockDTO
		if err := rows.Scan(
			&it.ID,
			&it.Label,
			&it.CategoryID,
			&it.ImagePath,
			&it.Quantity,
		); err != nil {
			return nil, fmt.Errorf("scan item: %w", err)
		}
		items = append(items, it)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate items: %w", err)
	}

	return items, nil
}

// GetItemsByCategory returns the items of a given category along with their stock.
func (s *StockService) GetItemsByCategory(categoryID int64) ([]ItemWithStockDTO, error) {
	if s.db == nil {
		return nil, fmt.Errorf("database is not initialized")
	}

	rows, err := s.db.Query(`
		SELECT
			i.id,
			i.label,
			i.category_id,
			COALESCE(i.image_path, ''),
			COALESCE(st.quantity, -1)
		FROM items i
		LEFT JOIN stocks st ON st.item_id = i.id
		WHERE i.category_id = ?
		ORDER BY i.label ASC
	`, categoryID)
	if err != nil {
		return nil, fmt.Errorf("query items by category: %w", err)
	}
	defer rows.Close()

	var items []ItemWithStockDTO
	for rows.Next() {
		var it ItemWithStockDTO
		if err := rows.Scan(
			&it.ID,
			&it.Label,
			&it.CategoryID,
			&it.ImagePath,
			&it.Quantity,
		); err != nil {
			return nil, fmt.Errorf("scan item (by category): %w", err)
		}
		items = append(items, it)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate items (by category): %w", err)
	}

	return items, nil
}

// CreateItem creates a new item and initializes its stock to 0.
// Returns the ID of the new item.
func (s *StockService) CreateItem(label string, categoryID int64, imagePath string) (int64, error) {
	if s.db == nil {
		return 0, fmt.Errorf("database is not initialized")
	}
	if label == "" {
		return 0, fmt.Errorf("label must not be empty")
	}
	if categoryID <= 0 {
		return 0, fmt.Errorf("invalid category id")
	}

	tx, err := s.db.Begin()
	if err != nil {
		return 0, fmt.Errorf("begin transaction: %w", err)
	}
	defer tx.Rollback()

	var imgArg interface{}
	if imagePath != "" {
		imgArg = imagePath
	}

	result, err := tx.Exec(
		`INSERT INTO items (label, category_id, image_path) VALUES (?, ?, ?)`,
		label, categoryID, imgArg,
	)
	if err != nil {
		return 0, fmt.Errorf("insert item: %w", err)
	}

	itemID, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("last insert id (item): %w", err)
	}

	// Initializes the stock to 0
	if _, err := tx.Exec(
		`INSERT INTO stocks (item_id, quantity) VALUES (?, 0)`,
		itemID,
	); err != nil {
		return 0, fmt.Errorf("init stock: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return 0, fmt.Errorf("commit create item: %w", err)
	}

	return itemID, nil
}

// UpdateItem updates the label, category, and image path of an item.
func (s *StockService) UpdateItem(id int64, label string, categoryID int64, imagePath string) error {
	if s.db == nil {
		return fmt.Errorf("database is not initialized")
	}
	if label == "" {
		return fmt.Errorf("label must not be empty")
	}
	if categoryID <= 0 {
		return fmt.Errorf("invalid category id")
	}

	var imgArg interface{}
	if imagePath != "" {
		imgArg = imagePath
	}

	result, err := s.db.Exec(
		`UPDATE items SET label = ?, category_id = ?, image_path = ? WHERE id = ?`,
		label, categoryID, imgArg, id,
	)
	if err != nil {
		return fmt.Errorf("update item: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("rows affected (update item): %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("item %d not found", id)
	}

	return nil
}

// DeleteItem deletes an item.
// The associated stock entry is automatically deleted (ON DELETE CASCADE).
// Fails if orders reference this item (ON DELETE RESTRICT on orders).
func (s *StockService) DeleteItem(id int64) error {
	if s.db == nil {
		return fmt.Errorf("database is not initialized")
	}

	result, err := s.db.Exec(`DELETE FROM items WHERE id = ?`, id)
	if err != nil {
		return fmt.Errorf("delete item: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("rows affected (delete item): %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("item %d not found", id)
	}

	return nil
}

// GetStock returns the stock of a specific item.
func (s *StockService) GetStock(itemID int64) (*StockDTO, error) {
	if s.db == nil {
		return nil, fmt.Errorf("database is not initialized")
	}

	var st StockDTO
	err := s.db.QueryRow(
		`SELECT id, item_id, quantity FROM stocks WHERE item_id = ?`,
		itemID,
	).Scan(&st.ID, &st.ItemID, &st.Quantity)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("no stock entry for item %d", itemID)
	}
	if err != nil {
		return nil, fmt.Errorf("query stock: %w", err)
	}

	return &st, nil
}

// SetStock sets the stock quantity of an item to an absolute value.
// Uses an UPSERT to handle the case where the item does not yet exist.
func (s *StockService) SetStock(itemID int64, quantity int64) error {
	if s.db == nil {
		return fmt.Errorf("database is not initialized")
	}
	if quantity < 0 {
		return fmt.Errorf("quantity must be >= 0")
	}

	_, err := s.db.Exec(`
		INSERT INTO stocks (item_id, quantity)
		VALUES (?, ?)
		ON CONFLICT(item_id) DO UPDATE SET quantity = excluded.quantity
	`, itemID, quantity)
	if err != nil {
		return fmt.Errorf("set stock: %w", err)
	}

	return nil
}

// AdjustStock adds (or subtracts if negative) a quantity to the existing stock.
// Returns an error if the resulting stock would be negative.
func (s *StockService) AdjustStock(itemID int64, delta int64) error {
	if s.db == nil {
		return fmt.Errorf("database is not initialized")
	}

	tx, err := s.db.Begin()
	if err != nil {
		return fmt.Errorf("begin transaction: %w", err)
	}
	defer tx.Rollback()

	var current int64
	err = tx.QueryRow(
		`SELECT quantity FROM stocks WHERE item_id = ?`,
		itemID,
	).Scan(&current)
	if err == sql.ErrNoRows {
		return fmt.Errorf("no stock entry for item %d", itemID)
	}
	if err != nil {
		return fmt.Errorf("query current stock: %w", err)
	}

	newQty := current + delta
	if newQty < 0 {
		return fmt.Errorf(
			"insufficient stock: current=%d delta=%d would result in %d",
			current, delta, newQty,
		)
	}

	if _, err := tx.Exec(
		`UPDATE stocks SET quantity = ? WHERE item_id = ?`,
		newQty, itemID,
	); err != nil {
		return fmt.Errorf("adjust stock: %w", err)
	}

	return tx.Commit()
}

// GetLowStockItems returns items whose stock is less than or equal to the given threshold.
func (s *StockService) GetLowStockItems(threshold int64) ([]ItemWithStockDTO, error) {
	if s.db == nil {
		return nil, fmt.Errorf("database is not initialized")
	}

	rows, err := s.db.Query(`
		SELECT
			i.id,
			i.label,
			i.category_id,
			COALESCE(i.image_path, ''),
			st.quantity
		FROM items i
		INNER JOIN stocks st ON st.item_id = i.id
		WHERE st.quantity <= ?
		ORDER BY st.quantity ASC, i.label ASC
	`, threshold)
	if err != nil {
		return nil, fmt.Errorf("query low stock items: %w", err)
	}
	defer rows.Close()

	var items []ItemWithStockDTO
	for rows.Next() {
		var it ItemWithStockDTO
		if err := rows.Scan(
			&it.ID,
			&it.Label,
			&it.CategoryID,
			&it.ImagePath,
			&it.Quantity,
		); err != nil {
			return nil, fmt.Errorf("scan low stock item: %w", err)
		}
		items = append(items, it)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate low stock items: %w", err)
	}

	return items, nil
}
