package main

import (
	"context"
	"database/sql"
	"fmt"

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

	db, err := database.OpenSQLite("db/db.sqlite")
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
