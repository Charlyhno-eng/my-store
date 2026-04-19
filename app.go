package main

import (
	"context"
	"database/sql"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"my-store/internal/database"
	"my-store/internal/service"
)

type App struct {
	ctx             context.Context
	db              *sql.DB
	checkoutService *service.CheckoutService
}

func NewApp() *App {
	return &App{}
}

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

func (a *App) GetCheckoutCategories() ([]service.CategoryWithItemsDTO, error) {
	if a.checkoutService == nil {
		return nil, fmt.Errorf("checkout service is not initialized")
	}

	return a.checkoutService.GetCheckoutCategories()
}

func prepareDatabase() (string, error) {
	dbPath, err := getDatabasePath()
	if err != nil {
		return "", err
	}

	valid, err := isValidAppDatabase(dbPath)
	if err != nil {
		return "", fmt.Errorf("check target db validity: %w", err)
	}

	if valid {
		return dbPath, nil
	}

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

func getDatabasePath() (string, error) {
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
