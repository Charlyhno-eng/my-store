package service

import (
	"database/sql"
	"fmt"
)


type ItemDTO struct {
	ID        int64  `json:"id"`
	Label     string `json:"label"`
	ImagePath string `json:"imagePath"`
}

type CategoryWithItemsDTO struct {
	ID    int64     `json:"id"`
	Label string    `json:"label"`
	Items []ItemDTO `json:"items"`
}

type CheckoutService struct {
	db *sql.DB
}

type OrderHistoryDTO struct {
	ID        int64   `json:"id"`
	ItemID     int64   `json:"itemId"`
	ItemLabel  string  `json:"itemLabel"`
	Quantity   int64   `json:"quantity"`
	UnitPrice  float64 `json:"unitPrice"`
	LineTotal  float64 `json:"lineTotal"`
	OrderedAt  string  `json:"orderedAt"`
}


// NewCheckoutService creates a new CheckoutService instance
// with a given database connection.
func NewCheckoutService(db *sql.DB) *CheckoutService {
	return &CheckoutService{db: db}
}

// GetCheckoutCategories retrieves all categories and their associated items
// from the database.
func (s *CheckoutService) GetCheckoutCategories() ([]CategoryWithItemsDTO, error) {
	if s.db == nil {
		return nil, fmt.Errorf("database is not initialized")
	}

	rows, err := s.db.Query(`
		SELECT
			c.id,
			c.label,
			i.id,
			i.label,
			COALESCE(i.image_path, '')
		FROM categories c
		LEFT JOIN items i ON i.category_id = c.id
		ORDER BY c.label ASC, i.label ASC
	`)
	if err != nil {
		return nil, fmt.Errorf("query checkout categories: %w", err)
	}
	defer rows.Close()

	// Map used to group items by category ID
	categoryMap := make(map[int64]*CategoryWithItemsDTO)

	// Slice used to preserve the order of categories
	var orderedIDs []int64

	for rows.Next() {
		var categoryID int64
		var categoryLabel string
		var itemID sql.NullInt64
		var itemLabel sql.NullString
		var imagePath sql.NullString

		// Scan each row from the SQL result
		if err := rows.Scan(
			&categoryID,
			&categoryLabel,
			&itemID,
			&itemLabel,
			&imagePath,
		); err != nil {
			return nil, fmt.Errorf("scan checkout row: %w", err)
		}

		// Check if the category already exists in the map
		category, exists := categoryMap[categoryID]
		if !exists {
			// If not, create it and store it
			category = &CategoryWithItemsDTO{
				ID:    categoryID,
				Label: categoryLabel,
				Items: []ItemDTO{},
			}
			categoryMap[categoryID] = category
			orderedIDs = append(orderedIDs, categoryID)
		}

		// If the row contains a valid item (LEFT JOIN can return NULL)
		if itemID.Valid {
			category.Items = append(category.Items, ItemDTO{
				ID:        itemID.Int64,
				Label:     itemLabel.String,
				ImagePath: imagePath.String,
			})
		}
	}

	// Check for errors during iteration
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate checkout rows: %w", err)
	}

	// Rebuild a properly ordered slice of categories
	categories := make([]CategoryWithItemsDTO, 0, len(orderedIDs))
	for _, id := range orderedIDs {
		categories = append(categories, *categoryMap[id])
	}

	return categories, nil
}

// InsertOrder inserts a new order into the database.
func (s *CheckoutService) InsertOrder(itemID int64, quantity int64, unitPrice float64) error {
	if s.db == nil {
		return fmt.Errorf("database is not initialized")
	}

	if quantity <= 0 {
		return fmt.Errorf("quantity must be greater than 0")
	}

	if unitPrice < 0 {
		return fmt.Errorf("unit price must be greater than or equal to 0")
	}

	result, err := s.db.Exec(`
		INSERT INTO orders (item_id, quantity, unit_price)
		VALUES (?, ?, ?)
	`, itemID, quantity, unitPrice)
	if err != nil {
		return fmt.Errorf(
			"insert order failed: itemID=%d quantity=%d unitPrice=%f err=%w",
			itemID,
			quantity,
			unitPrice,
			err,
		)
	}

	// Ensure exactly one row was affected
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("insert order rows affected failed: %w", err)
	}

	if rowsAffected != 1 {
		return fmt.Errorf("insert order affected %d rows", rowsAffected)
	}

	return nil
}

// GetOrdersHistory select all orders
func (s *CheckoutService) GetOrdersHistory() ([]OrderHistoryDTO, error) {
	if s.db == nil {
		return nil, fmt.Errorf("database is not initialized")
	}

	rows, err := s.db.Query(`
		SELECT
			o.id,
			o.item_id,
			COALESCE(i.label, ''),
			o.quantity,
			o.unit_price,
			(o.quantity * o.unit_price) AS line_total,
			o.ordered_at
		FROM orders o
		INNER JOIN items i ON i.id = o.item_id
		ORDER BY o.ordered_at DESC, o.id DESC
	`)
	if err != nil {
		return nil, fmt.Errorf("query orders history: %w", err)
	}
	defer rows.Close()

	var orders []OrderHistoryDTO

	for rows.Next() {
		var order OrderHistoryDTO

		if err := rows.Scan(
			&order.ID,
			&order.ItemID,
			&order.ItemLabel,
			&order.Quantity,
			&order.UnitPrice,
			&order.LineTotal,
			&order.OrderedAt,
		); err != nil {
			return nil, fmt.Errorf("scan order history row: %w", err)
		}

		orders = append(orders, order)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate order history rows: %w", err)
	}

	return orders, nil
}
