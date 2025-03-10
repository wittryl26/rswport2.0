# PostgreSQL Password Management Guide

## Finding Your PostgreSQL Password

If you're encountering a "password authentication failed" error, you need to use the correct password for your PostgreSQL user (in this case, "postgres").

### If You Set the Password During Installation:

Use the password you provided during the PostgreSQL installation.

### If You Forgot the Password:

#### Windows:
1. Open Windows Services (services.msc)
2. Find and stop the PostgreSQL service
3. Edit pg_hba.conf (usually in C:\Program Files\PostgreSQL\XX\data\)
4. Change authentication method from "md5" to "trust" temporarily
5. Start PostgreSQL service
6. Open command prompt and run:
   ```
   psql -U postgres
   ```
7. Then reset the password:
   ```sql
   ALTER USER postgres WITH PASSWORD 'new_password';
   ```
8. Exit with `\q`
9. Revert pg_hba.conf back to "md5"
10. Restart PostgreSQL service

#### macOS/Linux:
```bash
sudo -u postgres psql
```
Then:
```sql
ALTER USER postgres WITH PASSWORD 'new_password';
```

## Updating Your .env File

After you have the correct password, update your .env file:

```
DB_PASSWORD=your_correct_postgres_password
```

## Test Your Connection

After updating the password, run:

```bash
node test-db-connection.js
```

## Creating a New Database User (More Secure Approach)

Instead of using the postgres superuser, consider creating a dedicated user for your application:

1. Connect to PostgreSQL as postgres user
2. Run:
   ```sql
   CREATE USER appuser WITH PASSWORD 'secure_password';
   CREATE DATABASE portfolio;
   GRANT ALL PRIVILEGES ON DATABASE portfolio TO appuser;
   ```
3. Update your .env file:
   ```
   DB_USER=appuser
   DB_PASSWORD=secure_password
   ```

## Running PostgreSQL Without a Password (Development Only)

For local development, you can configure PostgreSQL to trust local connections:

1. Edit pg_hba.conf
2. Change authentication method from "md5" to "trust" for localhost connections
3. Restart PostgreSQL service

Note: This is insecure and should only be done in isolated development environments.
