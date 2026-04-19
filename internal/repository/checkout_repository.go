package repository

import (
	"database/sql"
	"fmt"

	"my-store/internal/service"
)

type CheckoutRepository struct {
	db *sql.DB
}

func NewCheckoutRepository(db *sql.DB) *CheckoutRepository {
	return &CheckoutRepository{db: db}
}

func (r *CheckoutRepository) GetCategoriesWithItems() ([]service.CategoryWithItemsDTO, error) {
	categoryRows, err := r.db.Query(`
		SELECT id, label
		FROM categories
		ORDER BY label ASC
	`)
	if err != nil {
		return nil, fmt.Errorf("query categories: %w", err)
	}
	defer categoryRows.Close()

	var categories []service.CategoryWithItemsDTO

	for categoryRows.Next() {
		var category service.CategoryWithItemsDTO

		if err := categoryRows.Scan(&category.ID, &category.Label); err != nil {
			return nil, fmt.Errorf("scan category: %w", err)
		}

		itemRows, err := r.db.Query(`
			SELECT id, label, COALESCE(image_path, '')
			FROM items
			WHERE category_id = ?
			ORDER BY label ASC
		`, category.ID)
		if err != nil {
			return nil, fmt.Errorf("query items for category %d: %w", category.ID, err)
		}

		var items []service.ItemDTO

		for itemRows.Next() {
			var item service.ItemDTO
			if err := itemRows.Scan(&item.ID, &item.Label, &item.ImagePath); err != nil {
				itemRows.Close()
				return nil, fmt.Errorf("scan item: %w", err)
			}
			items = append(items, item)
		}

		if err := itemRows.Err(); err != nil {
			itemRows.Close()
			return nil, fmt.Errorf("iterate items: %w", err)
		}

		itemRows.Close()

		category.Items = items
		categories = append(categories, category)
	}

	if err := categoryRows.Err(); err != nil {
		return nil, fmt.Errorf("iterate categories: %w", err)
	}

	return categories, nil
}
