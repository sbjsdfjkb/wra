# SQL-Based Bank Application

This is an enhanced version of the bank application with improved SQL database support, including configuration for multiple database backends.

## Features

- Robust SQL database integration using Flask-SQLAlchemy
- Support for multiple database backends (SQLite, PostgreSQL, MySQL)
- Enhanced data models with proper relationships and constraints
- Improved transaction management and security
- Database initialization script

## Setup Instructions

### 1. Install Dependencies

```bash
cd bank_app
pip install -r requirements.txt
```

### 2. Environment Configuration

Set the `DATABASE_URL` environment variable to connect to your preferred database:

#### For PostgreSQL:
```bash
export DATABASE_URL=postgresql://username:password@localhost/database_name
```

#### For MySQL:
```bash
export DATABASE_URL=mysql+pymysql://username:password@localhost/database_name
```

#### For SQLite (default):
No environment variable needed, or set:
```bash
export DATABASE_URL=sqlite:///bank.db
```

### 3. Initialize the Database

Run the initialization script to create tables and sample data:

```bash
python init_db.py
```

Alternatively, you can run the application directly:
```bash
python app.py
```

### 4. Run the Application

```bash
python app.py
```

The application will be available at `http://localhost:5000`

## Database Schema

### Users Table
- id (Primary Key)
- username (Unique)
- email (Unique)
- password_hash
- balance
- created_at
- is_active

### Cards Table
- id (Primary Key)
- card_number (Unique)
- card_holder_name
- expiry_date
- cvv
- card_type
- is_active
- created_at
- user_id (Foreign Key)

### Transactions Table
- id (Primary Key)
- amount
- transaction_type
- description
- timestamp
- user_id (Foreign Key)
- balance_after
- reference_number (Unique)

### Messages Table
- id (Primary Key)
- content
- timestamp
- user_id (Foreign Key)
- sender_username

## Authentication

- Default admin user: `admin` / `password`
- Sample users: `johndoe` / `password`, `janedoe` / `password`

## Security Features

- Password hashing using Werkzeug security functions
- User session management with Flask-Login
- Input validation and sanitization
- SQL injection protection through SQLAlchemy ORM