from flask import Blueprint, request, jsonify
from models import db, Product

product_bp = Blueprint('products', __name__)

@product_bp.route('/', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([product.to_dict() for product in products])

@product_bp.route('/<int:id>', methods=['GET'])
def get_product(id):
    product = Product.query.get_or_404(id)
    return jsonify(product.to_dict())

@product_bp.route('/', methods=['POST'])
def create_product():
    data = request.get_json()
    
    # Check for existing SKU if provided
    if data.get('sku'):
        if Product.query.filter_by(sku=data.get('sku')).first():
            return jsonify({'error': 'SKU already exists'}), 400
    
    product = Product(
        name=data.get('name'),
        description=data.get('description'),
        price=data.get('price'),
        stock_level=data.get('stock_level', 0),
        image_url=data.get('image_url'),
        category=data.get('category'),
        sku=data.get('sku'),
        brand=data.get('brand'),
        weight=data.get('weight'),
        dimensions=data.get('dimensions'),
        features=data.get('features')
    )
    
    db.session.add(product)
    db.session.commit()
    
    return jsonify(product.to_dict()), 201

@product_bp.route('/<int:id>', methods=['PUT'])
def update_product(id):
    product = Product.query.get_or_404(id)
    data = request.get_json()
    
    # Check SKU uniqueness if it's being changed
    if data.get('sku') and data.get('sku') != product.sku:
        if Product.query.filter_by(sku=data.get('sku')).first():
            return jsonify({'error': 'SKU already exists'}), 400
    
    product.name = data.get('name', product.name)
    product.description = data.get('description', product.description)
    product.price = data.get('price', product.price)
    product.stock_level = data.get('stock_level', product.stock_level)
    product.image_url = data.get('image_url', product.image_url)
    product.category = data.get('category', product.category)
    product.sku = data.get('sku', product.sku)
    product.brand = data.get('brand', product.brand)
    product.weight = data.get('weight', product.weight)
    product.dimensions = data.get('dimensions', product.dimensions)
    product.features = data.get('features', product.features)
    
    db.session.commit()
    
    return jsonify(product.to_dict())

@product_bp.route('/<int:id>', methods=['DELETE'])
def delete_product(id):
    product = Product.query.get_or_404(id)
    db.session.delete(product)
    db.session.commit()
    return '', 204

@product_bp.route('/<int:id>/stock', methods=['PATCH'])
def update_stock(id):
    product = Product.query.get_or_404(id)
    data = request.get_json()
    
    if 'quantity' not in data:
        return jsonify({'error': 'Quantity is required'}), 400
    
    new_stock = product.stock_level + int(data['quantity'])
    if new_stock < 0:
        return jsonify({'error': 'Insufficient stock'}), 400
    
    product.stock_level = new_stock
    db.session.commit()
    
    return jsonify(product.to_dict())
