import os
from datetime import datetime

from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

from decorators import require_wra_sign

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-this'

# Enhanced database configuration to support multiple SQL backends
DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL:
    # Use external database if DATABASE_URL is set
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
else:
    # Default to SQLite for local development
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bank.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'


# Database Models
class User(UserMixin, db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(120), nullable=False)
    balance = db.Column(db.Float, default=0.0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    # Relationships
    cards = db.relationship('Card', backref='user', lazy=True, cascade='all, delete-orphan')
    transactions = db.relationship('Transaction', backref='user', lazy=True, cascade='all, delete-orphan')
    messages = db.relationship('Message', backref='user', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.username}>'


class Card(db.Model):
    __tablename__ = 'cards'

    id = db.Column(db.Integer, primary_key=True)
    card_number = db.Column(db.String(19), unique=True, nullable=False, index=True)
    card_holder_name = db.Column(db.String(100), nullable=False)
    expiry_date = db.Column(db.Date, nullable=False)
    cvv = db.Column(db.String(4), nullable=False)  # Allow 4 digits for Amex
    card_type = db.Column(db.String(20), nullable=False)  # debit or credit
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    def __repr__(self):
        return f'<Card {self.card_number[-4:]}>'


class Transaction(db.Model):
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    transaction_type = db.Column(db.String(20), nullable=False)  # deposit, withdrawal, transfer
    description = db.Column(db.String(200))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    # Additional fields for better tracking
    balance_after = db.Column(db.Float, nullable=False)
    reference_number = db.Column(db.String(50), unique=True, nullable=False)

    def __repr__(self):
        return f'<Transaction {self.id}: {self.transaction_type} ${self.amount}>'


class Message(db.Model):
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)  # Changed to Text for longer messages
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    sender_username = db.Column(db.String(80), nullable=False)

    def __repr__(self):
        return f'<Message from {self.sender_username}>'


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


def generate_reference_number():
    """Generate a unique reference number for transactions"""
    import uuid
    return str(uuid.uuid4())[:12].upper()


# Routes
@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        # Handle both traditional form submission and AJAX requests
        if request.is_json:
            # AJAX request - return JSON response
            data = request.get_json()
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
        else:
            # Traditional form submission
            username = request.form['username']
            email = request.form['email']
            password = request.form['password']

        # Check if user already exists
        if User.query.filter_by(username=username).first():
            if request.is_json:
                return jsonify({'success': False, 'error': 'Username already exists'})
            else:
                flash('Username already exists')
                return redirect(url_for('register'))

        if User.query.filter_by(email=email).first():
            if request.is_json:
                return jsonify({'success': False, 'error': 'Email already registered'})
            else:
                flash('Email already registered')
                return redirect(url_for('register'))

        # Create new user
        hashed_password = generate_password_hash(password)
        new_user = User(username=username, email=email, password_hash=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        if request.is_json:
            return jsonify({'success': True, 'redirect': url_for('login')})
        else:
            flash('Registration successful')
            return redirect(url_for('login'))

    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # Handle both traditional form submission and AJAX requests
        if request.is_json:
            # AJAX request - return JSON response
            data = request.get_json()
            username = data.get('username')
            password = data.get('password')
        else:
            # Traditional form submission
            username = request.form['username']
            password = request.form['password']

        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password_hash, password) and user.is_active:
            login_user(user)
            if request.is_json:
                # Return JSON response for AJAX
                resp = jsonify({'success': True, 'redirect': url_for('dashboard')})
                resp.headers['X-Wra-Data'] = user.id
                return resp
            else:
                # Traditional redirect
                resp = redirect(url_for('dashboard'))
                resp.headers['X-Wra-Data'] = user.id
                return resp
        else:
            if request.is_json:
                return jsonify({'success': False, 'error': 'Invalid credentials'})
            else:
                flash('Invalid credentials')
                return redirect(url_for('login'))

    return render_template('login.html')


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))


@app.route('/dashboard')
@login_required
def dashboard():
    transactions = Transaction.query.filter_by(user_id=current_user.id).order_by(Transaction.timestamp.desc()).limit(
        5).all()
    cards = Card.query.filter_by(user_id=current_user.id).all()
    return render_template('dashboard.html', user=current_user, transactions=transactions, cards=cards)


@app.route('/operations')
@login_required
def operations():
    transactions = Transaction.query.filter_by(user_id=current_user.id).order_by(Transaction.timestamp.desc()).all()
    return render_template('operations.html', transactions=transactions)


@app.route('/add_transaction', methods=['POST'])
@login_required
@require_wra_sign
def add_transaction():
    # Handle both traditional form submission and AJAX requests
    if request.is_json:
        # AJAX request - return JSON response
        data = request.get_json()
        amount = float(data.get('amount'))
        transaction_type = data.get('type')
        description = data.get('description')
    else:
        # Traditional form submission
        amount = float(request.form['amount'])
        transaction_type = request.form['type']
        description = request.form['description']

    # Validate transaction type
    # valid_types = ['deposit', 'withdrawal', 'transfer']
    valid_types = ['transfer']
    if transaction_type not in valid_types:
        if request.is_json:
            return jsonify({'success': False, 'error': 'Invalid transaction type'})
        else:
            flash('Invalid transaction type')
            return redirect(url_for('operations'))

    # Generate unique reference number
    reference_number = generate_reference_number()

    # Create transaction record
    new_transaction = Transaction(
        amount=-abs(amount),
        transaction_type=transaction_type,
        description=description,
        user_id=current_user.id,
        reference_number=reference_number
    )

    # Update balance based on transaction type
    old_balance = current_user.balance
    if transaction_type == 'deposit':
        current_user.balance += amount
    elif transaction_type == 'withdrawal':
        if current_user.balance >= amount:
            current_user.balance -= amount
        else:
            if request.is_json:
                return jsonify({'success': False, 'error': 'Insufficient funds'})
            else:
                flash('Insufficient funds')
                return redirect(url_for('operations'))
    elif transaction_type == 'transfer':
        # For transfers, assume positive means money out, negative means money in
        current_user.balance -= amount

    # Calculate balance after transaction
    new_transaction.balance_after = current_user.balance

    db.session.add(new_transaction)
    db.session.commit()

    if request.is_json:
        return jsonify({
            'success': True,
            'message': 'Transaction added successfully',
            'transaction': {
                'id': new_transaction.id,
                'amount': new_transaction.amount,
                'type': new_transaction.transaction_type,
                'description': new_transaction.description,
                'timestamp': new_transaction.timestamp.isoformat(),
                'balance_after': new_transaction.balance_after
            }
        })
    else:
        flash('Transaction added successfully')
        return redirect(url_for('operations'))



def init_db():
    """Initialize the database with tables and sample data."""
    with app.app_context():
        # Create all tables
        db.create_all()

        # Create a default admin user if none exists
        if not User.query.first():
            admin = User(
                username='admin',
                email='admin@example.com',
                password_hash=generate_password_hash('password'),
                balance=1000.0
            )
            db.session.add(admin)
            db.session.commit()
            print("Admin user created: admin / password")


@app.route("/api/test", methods=['POST', 'GET'])
def testapi():
    return jsonify(list(request.headers))


if __name__ == '__main__':
    init_db()
    app.run(debug=True, host="0.0.0.0")
