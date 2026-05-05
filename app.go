package main

import (
	"context"
	"database/sql"
	"embed"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"my-store/internal/database"
	"my-store/internal/service"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed db/db.sqlite
var embeddedDB embed.FS


type App struct {
	ctx             context.Context
	db              *sql.DB
	checkoutService *service.CheckoutService
	stockService    *service.StockService
}


// NewApp creates and returns a new instance of App.
func NewApp() *App {
	return &App{}
}

// startup is called when the application starts.
// It initializes the database and services.
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	dbPath, err := prepareDatabase()
	if err != nil {
		panic(err)
	}

	db, err := database.OpenSQLite(dbPath)
	if err != nil {
		panic(err)
	}

	a.db = db
	a.checkoutService = service.NewCheckoutService(db)
	a.stockService = service.NewStockService(db)
}

// prepareDatabase returns a path to a usable database file,
// copying the embedded seed database on first run if needed.
func prepareDatabase() (string, error) {
	dbPath, err := getDatabasePath()
	if err != nil {
		return "", err
	}

	if _, err := os.Stat(dbPath); err == nil {
		return dbPath, nil
	}

	if err := os.MkdirAll(filepath.Dir(dbPath), 0o755); err != nil {
		return "", fmt.Errorf("create db directory: %w", err)
	}

	if err := copyEmbeddedDB(dbPath); err != nil {
		return "", fmt.Errorf("copy embedded database: %w", err)
	}

	return dbPath, nil
}

// getDatabasePath returns the local dev path if it exists,
// otherwise falls back to the user config directory.
func getDatabasePath() (string, error) {
	localPath := filepath.Join("db", "db.sqlite")
	if _, err := os.Stat(localPath); err == nil {
		return localPath, nil
	}

	configDir, err := os.UserConfigDir()
	if err != nil {
		return "", fmt.Errorf("get user config dir: %w", err)
	}

	appDir := filepath.Join(configDir, "my-store")
	if err := os.MkdirAll(appDir, 0o755); err != nil {
		return "", fmt.Errorf("create app dir: %w", err)
	}

	return filepath.Join(appDir, "db.sqlite"), nil
}

// copyEmbeddedDB extracts the bundled database to destPath.
func copyEmbeddedDB(destPath string) error {
	src, err := embeddedDB.Open("db/db.sqlite")
	if err != nil {
		return fmt.Errorf("open embedded database: %w", err)
	}
	defer src.Close()

	dst, err := os.Create(destPath)
	if err != nil {
		return fmt.Errorf("create destination file: %w", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		return fmt.Errorf("copy content: %w", err)
	}

	return dst.Sync()
}

// GetCheckoutCategories retrieves categories and their associated items
// for the checkout process using the CheckoutService.
func (a *App) GetCheckoutCategories() ([]service.CategoryWithItemsDTO, error) {
	if a.checkoutService == nil {
		return nil, fmt.Errorf("checkout service is not initialized")
	}
	return a.checkoutService.GetCheckoutCategories()
}

// InsertOrder inserts an order into the database using the CheckoutService.
func (a *App) InsertOrder(itemID int64, quantity int64, unitPrice float64) error {
	if a.checkoutService == nil {
		return fmt.Errorf("checkout service is not initialized")
	}
	return a.checkoutService.InsertOrder(itemID, quantity, unitPrice)
}

// SaveReceipt saves the receipt content to a file using the runtime package.
func (a *App) SaveReceipt(content string) error {
	if a.ctx == nil {
		return fmt.Errorf("application context is not initialized")
	}

	filePath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Enregistrer le ticket",
		DefaultFilename: fmt.Sprintf("ticket-%s.txt", time.Now().Format("2006-01-02-15-04-05")),
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Fichier texte (*.txt)",
				Pattern:     "*.txt",
			},
		},
	})
	if err != nil {
		return fmt.Errorf("open save file dialog: %w", err)
	}

	if strings.TrimSpace(filePath) == "" {
		return fmt.Errorf("save cancelled")
	}

	if err := os.WriteFile(filePath, []byte(content), 0o644); err != nil {
		return fmt.Errorf("write receipt file: %w", err)
	}

	return nil
}

// GetOrdersHistory select all orders to create a history
func (a *App) GetOrdersHistory() ([]service.OrderHistoryDTO, error) {
	if a.checkoutService == nil {
		return nil, fmt.Errorf("checkout service is not initialized")
	}
	return a.checkoutService.GetOrdersHistory()
}

// GetCategories retrieves all categories from the stock service.
func (a *App) GetCategories() ([]service.CategoryDTO, error) {
	if a.stockService == nil {
		return nil, errServiceNotInit("stock")
	}
	return a.stockService.GetCategories()
}

// CreateCategory creates a new category with the given label using the stock service.
func (a *App) CreateCategory(label string) (int64, error) {
	if a.stockService == nil {
		return 0, errServiceNotInit("stock")
	}
	return a.stockService.CreateCategory(label)
}

// UpdateCategory updates the label of an existing category using the stock service.
func (a *App) UpdateCategory(id int64, label string) error {
	if a.stockService == nil {
		return errServiceNotInit("stock")
	}
	return a.stockService.UpdateCategory(id, label)
}

// DeleteCategory deletes a category by its ID using the stock service.
func (a *App) DeleteCategory(id int64) error {
	if a.stockService == nil {
		return errServiceNotInit("stock")
	}
	return a.stockService.DeleteCategory(id)
}

// GetItems retrieves all items from the stock service.
func (a *App) GetItems() ([]service.ItemWithStockDTO, error) {
	if a.stockService == nil {
		return nil, errServiceNotInit("stock")
	}
	return a.stockService.GetItems()
}

// GetItemsByCategory retrieves all items by their category ID using the stock service.
func (a *App) GetItemsByCategory(categoryID int64) ([]service.ItemWithStockDTO, error) {
	if a.stockService == nil {
		return nil, errServiceNotInit("stock")
	}
	return a.stockService.GetItemsByCategory(categoryID)
}

// CreateItem creates a new item with the given label, category ID, and image path using the stock service.
func (a *App) CreateItem(label string, categoryID int64, imagePath string) (int64, error) {
	if a.stockService == nil {
		return 0, errServiceNotInit("stock")
	}
	return a.stockService.CreateItem(label, categoryID, imagePath)
}

// UpdateItem updates the label, category ID, and image path of an existing item using the stock service.
func (a *App) UpdateItem(id int64, label string, categoryID int64, imagePath string) error {
	if a.stockService == nil {
		return errServiceNotInit("stock")
	}
	return a.stockService.UpdateItem(id, label, categoryID, imagePath)
}

// DeleteItem deletes an item by its ID using the stock service.
func (a *App) DeleteItem(id int64) error {
	if a.stockService == nil {
		return errServiceNotInit("stock")
	}
	return a.stockService.DeleteItem(id)
}

// GetStock retrieves the stock information for an item by its ID using the stock service.
func (a *App) GetStock(itemID int64) (*service.StockDTO, error) {
	if a.stockService == nil {
		return nil, errServiceNotInit("stock")
	}
	return a.stockService.GetStock(itemID)
}

// SetStock sets the stock quantity for an item by its ID using the stock service.
func (a *App) SetStock(itemID int64, quantity int64) error {
	if a.stockService == nil {
		return errServiceNotInit("stock")
	}
	return a.stockService.SetStock(itemID, quantity)
}

// AdjustStock adjusts the stock quantity for an item by its ID using the stock service.
func (a *App) AdjustStock(itemID int64, delta int64) error {
	if a.stockService == nil {
		return errServiceNotInit("stock")
	}
	return a.stockService.AdjustStock(itemID, delta)
}

// GetLowStockItems retrieves items with low stock quantity using the stock service.
func (a *App) GetLowStockItems(threshold int64) ([]service.ItemWithStockDTO, error) {
	if a.stockService == nil {
		return nil, errServiceNotInit("stock")
	}
	return a.stockService.GetLowStockItems(threshold)
}


// errServiceNotInit returns an error indicating that a service is not initialized.
func errServiceNotInit(name string) error {
	return fmt.Errorf("%s service is not initialized", name)
}
