from flask import Blueprint, request, jsonify
from models import db, Customer

customer_bp = Blueprint('customers', __name__)

@customer_bp.route('/', methods=['GET'])
def get_customers():
    customers = Customer.query.all()
    return jsonify([customer.to_dict() for customer in customers])

@customer_bp.route('/<int:id>', methods=['GET'])
def get_customer(id):
    customer = Customer.query.get_or_404(id)
    return jsonify(customer.to_dict())

@customer_bp.route('/', methods=['POST'])
def create_customer():
    data = request.get_json()
    
    # Check for existing email
    if Customer.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    customer = Customer(
        name=data.get('name'),
        email=data.get('email'),
        phone=data.get('phone'),
        address=data.get('address'),
        company=data.get('company'),
        website=data.get('website'),
        notes=data.get('notes'),
        status=data.get('status', 'active')
    )
    
    db.session.add(customer)
    db.session.commit()
    
    return jsonify(customer.to_dict()), 201

@customer_bp.route('/<int:id>', methods=['PUT'])
def update_customer(id):
    customer = Customer.query.get_or_404(id)
    data = request.get_json()
    
    # Check email uniqueness if it's being changed
    if data.get('email') != customer.email:
        if Customer.query.filter_by(email=data.get('email')).first():
            return jsonify({'error': 'Email already exists'}), 400
    
    customer.name = data.get('name', customer.name)
    customer.email = data.get('email', customer.email)
    customer.phone = data.get('phone', customer.phone)
    customer.address = data.get('address', customer.address)
    customer.company = data.get('company', customer.company)
    customer.website = data.get('website', customer.website)
    customer.notes = data.get('notes', customer.notes)
    customer.status = data.get('status', customer.status)
    
    db.session.commit()
    
    return jsonify(customer.to_dict())

@customer_bp.route('/<int:id>', methods=['DELETE'])
def delete_customer(id):
    customer = Customer.query.get_or_404(id)
    db.session.delete(customer)
    db.session.commit()
    return '', 204
