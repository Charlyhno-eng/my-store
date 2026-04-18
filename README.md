# my-store
Desktop application for retail stores to handle checkout and inventory management

**Initial Deployment Context**

My-Store will initially be deployed in the Democratic Republic of Congo, targeting small supermarkets and retail shops. This market has a strong price negotiation culture, so product prices in the database are not fixed.

**Country Adaptation Required**

If you clone this repository for use in your country, you must adapt the pricing logic to match local commercial practices. Fixed prices may be more appropriate for markets without negotiation traditions.

---

## Installation

You must have npm and go installed beforehand.

```bash
cd my-store

sudo apt update
sudo apt install -y build-essential libgtk-3-dev libwebkit2gtk-4.1-dev pkg-config

go install github.com/wailsapp/wails/v2/cmd/wails@latest
export PATH="$PATH:$HOME/go/bin"

wails doctor

cd frontend
npm install
cd ..
```

To setup the database :

```bash
cd backend
sqlite3 db/db.sqlite < db/schema.sql
```

## Start the app

```bash
wails dev -tags webkit2_41
```
