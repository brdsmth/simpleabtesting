# Database Migrations

SQL migration files for schema changes.

## Migration Files

Migrations are numbered sequentially and run in order:

- `001_initial_schema.sql` - Initial database schema
- `002_add_archived_columns.sql` - Add soft delete (archived) columns

## Running Migrations

Migrations run automatically when the API starts (Lambda cold start or local server startup).

## Manual Migration

To run migrations manually:

```bash
# Connect to database
psql "postgresql://USERNAME:PASSWORD@HOST:5432/simple_ab_testing"

# Run a specific migration
\i migrations/001_initial_schema.sql
\i migrations/002_add_archived_columns.sql
```

## Creating New Migrations

1. Create a new file: `XXX_description.sql` (e.g., `003_add_user_table.sql`)
2. Write your SQL using `IF NOT EXISTS` clauses for safety
3. Test locally first
4. Deploy - migrations run automatically on next Lambda start

## Migration Tracking

The system tracks which migrations have been run in the `schema_migrations` table.
