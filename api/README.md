# API

Express backend with PostgreSQL, deployable to AWS Lambda.

## Local Development

```bash
npm install
npm start
```

The API runs on `http://localhost:3000`

## Database Migrations

Migrations are in `/migrations` folder and run automatically on startup.

### Viewing Migrations

```bash
ls migrations/
# 001_initial_schema.sql
# 002_add_archived_columns.sql
```

### Creating New Migrations

```bash
# Create new file: 003_description.sql
touch migrations/003_add_user_roles.sql

# Write SQL with safety checks:
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
```

### Manual Migration

```bash
# Connect to database
psql $DATABASE_URL

# Check migration status
SELECT * FROM schema_migrations ORDER BY applied_at;

# Run manually if needed
\i migrations/001_initial_schema.sql
```

## Lambda Deployment

```bash
# Build Lambda bundle (includes migrations)
npm run build:lambda

# Output: ../api-lambda-bundle/index.js
```

The build automatically:
- Bundles all Node.js code
- Copies migrations folder
- Creates a deployment-ready package

## Architecture

- `app.js` - Express application setup
- `index.js` - Local development server
- `handler.js` - Lambda handler wrapper
- `lambda.js` - Build script for Lambda
- `config/database.js` - PostgreSQL connection + migrations
- `routes/` - API endpoints
- `migrations/` - SQL schema changes
