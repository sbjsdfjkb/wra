from app import app, db, User, Transaction, Card, Message
from werkzeug.security import generate_password_hash
from datetime import datetime, date


def init_db():
    """Initialize the database with tables and sample data."""
    with app.app_context():
        # Drop all existing tables (optional - be careful in production!)
        # db.drop_all()
        
        # Create all tables
        db.create_all()
        
        # Check if admin user already exists
        admin_user = User.query.filter_by(username='admin').first()
        
        if not admin_user:
            # Create a default admin user
            admin = User(
                username='admin',
                email='admin@example.com',
                password_hash=generate_password_hash('password'),
                balance=1000.0
            )
            db.session.add(admin)
            
            # Create some sample regular users
            user1 = User(
                username='johndoe',
                email='john@example.com',
                password_hash=generate_password_hash('password'),
                balance=500.0
            )
            db.session.add(user1)
            
            user2 = User(
                username='janedoe',
                email='jane@example.com',
                password_hash=generate_password_hash('password'),
                balance=1200.0
            )
            db.session.add(user2)
            
            # Commit users to get IDs for foreign keys
            db.session.commit()
            
            # Add sample cards for users
            card1 = Card(
                card_number='4111111111111111',  # Visa test number
                card_holder_name='John Doe',
                expiry_date=date(2027, 12, 31),
                cvv='123',
                card_type='debit',
                user_id=user1.id
            )
            db.session.add(card1)
            
            card2 = Card(
                card_number='5555555555554444',  # Mastercard test number
                card_holder_name='Jane Doe',
                expiry_date=date(2026, 10, 31),
                cvv='456',
                card_type='credit',
                user_id=user2.id
            )
            db.session.add(card2)
            
            # Add sample transactions
            from app import generate_reference_number
            
            transaction1 = Transaction(
                amount=100.0,
                transaction_type='deposit',
                description='Initial deposit',
                user_id=user1.id,
                balance_after=600.0,
                reference_number=generate_reference_number()
            )
            db.session.add(transaction1)
            
            transaction2 = Transaction(
                amount=50.0,
                transaction_type='withdrawal',
                description='ATM withdrawal',
                user_id=user1.id,
                balance_after=550.0,
                reference_number=generate_reference_number()
            )
            db.session.add(transaction2)
            
            transaction3 = Transaction(
                amount=200.0,
                transaction_type='deposit',
                description='Payroll deposit',
                user_id=user2.id,
                balance_after=1400.0,
                reference_number=generate_reference_number()
            )
            db.session.add(transaction3)
            
            # Add sample messages
            message1 = Message(
                content='Welcome to our banking system!',
                user_id=admin.id,
                sender_username='admin'
            )
            db.session.add(message1)
            
            message2 = Message(
                content='Thanks for joining us!',
                user_id=user1.id,
                sender_username='johndoe'
            )
            db.session.add(message2)
            
            # Commit all changes
            db.session.commit()
            
            print("Database initialized successfully!")
            print("Created admin user: admin / password")
            print("Created sample users: johndoe / password, janedoe / password")
        else:
            print("Database already initialized. Skipping.")


if __name__ == "__main__":
    init_db()