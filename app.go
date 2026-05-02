package main

import (
	"context"
	"database/sql"
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


type App struct {
	ctx             context.Context
	db              *sql.DB
	checkoutService *service.CheckoutService
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
}

// prepareDatabase ensures that a usable database file exists.
// If no database is found, it copies a bundled default database
// into the user's config directory.
func prepareDatabase() (string, error) {
	dbPath, err := getDatabasePath()
	if err != nil {
		return "", err
	}

	// If database already exists, reuse it
	if _, err := os.Stat(dbPath); err == nil {
		return dbPath, nil
	}

	// Otherwise, copy the bundled database
	sourcePath, err := getBundledDatabasePath()
	if err != nil {
		return "", err
	}

	if err := os.MkdirAll(filepath.Dir(dbPath), 0o755); err != nil {
		return "", fmt.Errorf("create target db directory: %w", err)
	}

	if err := copyFile(sourcePath, dbPath); err != nil {
		return "", fmt.Errorf("copy initial database: %w", err)
	}

	return dbPath, nil
}

// getDatabasePath determines where the application's database should be stored.
// It first checks for a local project database, otherwise it falls back
// to a user-specific config directory.
func getDatabasePath() (string, error) {
	projectDBPath := filepath.Join("db", "db.sqlite")
	if _, err := os.Stat(projectDBPath); err == nil {
		return projectDBPath, nil
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

// getBundledDatabasePath tries to locate the default database file
// bundled with the application binary. It checks multiple possible paths.
func getBundledDatabasePath() (string, error) {
	execPath, err := os.Executable()
	if err != nil {
		return "", fmt.Errorf("get executable path: %w", err)
	}

	execDir := filepath.Dir(execPath)

	candidates := []string{
		filepath.Join(execDir, "db", "db.sqlite"),
		filepath.Join(execDir, "..", "..", "db", "db.sqlite"),
		filepath.Join(execDir, "..", "db", "db.sqlite"),
		filepath.Join("db", "db.sqlite"),
	}

	for _, candidate := range candidates {
		cleaned := filepath.Clean(candidate)
		if _, err := os.Stat(cleaned); err == nil {
			return cleaned, nil
		}
	}

	return "", fmt.Errorf("could not find bundled database file")
}

// isValidAppDatabase checks whether a given SQLite database file
// is valid for this application by verifying the existence of
// a required table ("categories").
func isValidAppDatabase(path string) (bool, error) {
	if _, err := os.Stat(path); err != nil {
		if os.IsNotExist(err) {
			return false, nil
		}
		return false, err
	}

	db, err := sql.Open("sqlite3", path)
	if err != nil {
		return false, err
	}
	defer db.Close()

	var count int
	err = db.QueryRow(`
		SELECT COUNT(*)
		FROM sqlite_master
		WHERE type = 'table'
		AND name = 'categories'
	`).Scan(&count)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// copyFile copies a file from src to dst.
// It ensures that the destination file is properly written and synced.
func copyFile(src string, dst string) error {
	sourceFile, err := os.Open(src)
	if err != nil {
		return fmt.Errorf("open source file: %w", err)
	}
	defer sourceFile.Close()

	destFile, err := os.Create(dst)
	if err != nil {
		return fmt.Errorf("create destination file: %w", err)
	}
	defer destFile.Close()

	if _, err := io.Copy(destFile, sourceFile); err != nil {
		return fmt.Errorf("copy file content: %w", err)
	}

	if err := destFile.Sync(); err != nil {
		return fmt.Errorf("sync destination file: %w", err)
	}

	return nil
}

// GetCheckoutCategories retrieves categories and their associated items
// for the checkout process using the CheckoutService.
func (a *App) GetCheckoutCategories() ([]service.CategoryWithItemsDTO, error) {
	if a.checkoutService == nil {
		return nil, fmt.Errorf("checkout service is not initialized")
	}

	return a.checkoutService.GetCheckoutCategories()
}

// InsertOrder creates a new order entry in the database
// with the given item ID, quantity, and unit price.
func (a *App) InsertOrder(itemID int64, quantity int64, unitPrice float64) error {
	if a.checkoutService == nil {
		return fmt.Errorf("checkout service is not initialized")
	}

	return a.checkoutService.InsertOrder(itemID, quantity, unitPrice)
}

// SaveReceipt opens a file dialog to let the user choose where to save a receipt.
// It writes the provided content into a text file.
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
