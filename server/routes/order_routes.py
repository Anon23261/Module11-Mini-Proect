from flask import Blueprint, request, jsonify
from models import db, Order, OrderItem, Product
from sqlalchemy.orm import joinedload

order_bp = Blueprint('orders', __name__)

@order_bp.route('/', methods=['GET'])
def get_orders():
    orders = Order.query.options(
        joinedload(Order.items).joinedload(OrderItem.product)
    ).all()
    return jsonify([order.to_dict() for order in orders])

@order_bp.route('/<int:id>', methods=['GET'])
def get_order(id):
    order = Order.query.options(
        joinedload(Order.items).joinedload(OrderItem.product)
    ).get_or_404(id)
    return jsonify(order.to_dict())

@order_bp.route('/', methods=['POST'])
def create_order():
    data = request.get_json()
    
    # Validate customer_id
    if not data.get('customer_id'):
        return jsonify({'error': 'Customer ID is required'}), 400
    
    # Validate order items
    if not data.get('items') or not isinstance(data['items'], list):
        return jsonify({'error': 'Order must contain items'}), 400
    
    # Calculate total and validate stock
    total = 0
    order_items = []
    
    for item_data in data['items']:
        product = Product.query.get(item_data['product_id'])
        if not product:
            return jsonify({'error': f'Product {item_data["product_id"]} not found'}), 404
        
        if product.stock_level < item_data['quantity']:
            return jsonify({'error': f'Insufficient stock for product {product.name}'}), 400
        
        # Calculate item total
        item_total = product.price * item_data['quantity']
        total += item_total
        
        # Create order item
        order_items.append({
            'product': product,
            'quantity': item_data['quantity'],
            'price': product.price
        })
        
        # Update stock
        product.stock_level -= item_data['quantity']
    
    # Create order
    order = Order(
        customer_id=data['customer_id'],
        status='pending',
        total=total
    )
    
    db.session.add(order)
    db.session.flush()  # Get order ID
    
    # Create order items
    for item in order_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item['product'].id,
            quantity=item['quantity'],
            price=item['price']
        )
        db.session.add(order_item)
    
    db.session.commit()
    
    return jsonify(order.to_dict()), 201

@order_bp.route('/<int:id>', methods=['PUT'])
def update_order(id):
    order = Order.query.get_or_404(id)
    data = request.get_json()
    
    if data.get('status'):
        order.status = data['status']
    
    db.session.commit()
    
    return jsonify(order.to_dict())

@order_bp.route('/<int:id>', methods=['DELETE'])
def delete_order(id):
    order = Order.query.get_or_404(id)
    
    # Restore product stock levels
    for item in order.items:
        product = item.product
        product.stock_level += item.quantity
    
    db.session.delete(order)
    db.session.commit()
    
    return '', 204

@order_bp.route('/customer/<int:customer_id>', methods=['GET'])
def get_customer_orders(customer_id):
    orders = Order.query.filter_by(customer_id=customer_id).options(
        joinedload(Order.items).joinedload(OrderItem.product)
    ).all()
    return jsonify([order.to_dict() for order in orders])
