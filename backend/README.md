# Backend Application Setup

## Quick Start

1. Install Dependencies:
```bash
# Install all dependencies (including yahoo-finance2)
node install-dependencies.js
# Or use npm directly
npm install
```

2. Start the Server:
```bash
npm start
# Or for development with auto-reload
npm run dev
```

3. Access the API:
- Health Check: http://localhost:3000/health
- Gold & INR/USD Data: http://localhost:3000/api/gold-inr-data
- Custom Financial Data: http://localhost:3000/api/financial-data

## Troubleshooting

### Module not found error

If you see an error like:
```
Error: Cannot find module 'yahoo-finance2'
```

Run the installation script or install the package directly:
```bash
npm install yahoo-finance2
```

### Manual Installation of yahoo-finance2

If the npm install command isn't working, try installing it explicitly:
```bash
npm install yahoo-finance2@latest
```

### Checking Installed Packages

To verify which packages are installed:
```bash
npm list --depth=0
```

### Database Connection Issues

If the server starts but can't connect to the database:

1. Verify your `.env` file has the correct database credentials:
```
DB_USER=youruser
DB_HOST=localhost
DB_NAME=yourdatabase
DB_PASSWORD=yourpassword
DB_PORT=5432
```

2. Make sure PostgreSQL is running on your system.

## Key Dependencies

- `express`: Web server framework
- `pg`: PostgreSQL client
- `yahoo-finance2`: Yahoo Finance API client for financial data
- `cors`: Cross-origin resource sharing middleware
- `dotenv`: Environment variable manager

## API Documentation

### GET /api/gold-inr-data

Returns 5 years of monthly Gold price and INR/USD exchange rate data.

### GET /api/financial-data

Customizable endpoint that accepts query parameters:

- `startDate`: Start date in YYYY-MM-DD format (default: 5 years ago)
- `endDate`: End date in YYYY-MM-DD format (default: today)
- `interval`: Data interval (1d, 5d, 1wk, 1mo, 3mo) (default: 1mo)

Example: `/api/financial-data?startDate=2022-01-01&endDate=2023-01-01&interval=1wk`
