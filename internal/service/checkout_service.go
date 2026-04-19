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

func NewCheckoutService(db *sql.DB) *CheckoutService {
	return &CheckoutService{db: db}
}

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

	categoryMap := make(map[int64]*CategoryWithItemsDTO)
	var orderedIDs []int64

	for rows.Next() {
		var categoryID int64
		var categoryLabel string
		var itemID sql.NullInt64
		var itemLabel sql.NullString
		var imagePath sql.NullString

		if err := rows.Scan(
			&categoryID,
			&categoryLabel,
			&itemID,
			&itemLabel,
			&imagePath,
		); err != nil {
			return nil, fmt.Errorf("scan checkout row: %w", err)
		}

		category, exists := categoryMap[categoryID]
		if !exists {
			category = &CategoryWithItemsDTO{
				ID:    categoryID,
				Label: categoryLabel,
				Items: []ItemDTO{},
			}
			categoryMap[categoryID] = category
			orderedIDs = append(orderedIDs, categoryID)
		}

		if itemID.Valid {
			category.Items = append(category.Items, ItemDTO{
				ID:        itemID.Int64,
				Label:     itemLabel.String,
				ImagePath: imagePath.String,
			})
		}
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate checkout rows: %w", err)
	}

	categories := make([]CategoryWithItemsDTO, 0, len(orderedIDs))
	for _, id := range orderedIDs {
		categories = append(categories, *categoryMap[id])
	}

	return categories, nil
}
