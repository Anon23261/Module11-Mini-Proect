# E-Commerce React Application 🛍️

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.0-purple.svg)](https://getbootstrap.com/)
[![Flask](https://img.shields.io/badge/Flask-2.2.2-green.svg)](https://flask.palletsprojects.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0.23-red.svg)](https://www.sqlalchemy.org/)
[![Code Style](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## 🌟 Description

A modern, feature-rich e-commerce application built with React and Flask. This application provides comprehensive customer management, product catalog handling, and order processing capabilities.

## ✨ Features

### 👤 Customer Management
- Create, read, update, and delete customer profiles
- Manage customer accounts and details
- Validate customer information
  
### 📦 Product Catalog
- Full product CRUD operations
- Real-time stock level management
- Automated restocking system
- Product confirmation modals
  
### 🛒 Order Processing
- Place new orders with multiple products
- View complete order history
- Cancel pending orders
- Real-time price calculation

## 🚀 Installation

1. Clone both repositories:
```bash
# Clone frontend
git clone <your-repo-url>
cd e-commerce-react

# Clone backend
git clone https://github.com/Anon23261/Module6-Mini-Project.git
cd Module6-Mini-Project
```

2. Install dependencies:
```bash
# Frontend
cd e-commerce-react
npm install

# Backend
cd ../Module6-Mini-Project
pip install -r requirements.txt
```

3. Start both servers:
```bash
# Start backend (in Module6-Mini-Project directory)
python main.py

# Start frontend (in e-commerce-react directory)
npm start
```

## 🔧 Technologies Used

### Frontend
- React 18.2.0
- React Router DOM 6.x
- React Bootstrap 2.x
- Axios for API calls
- React Icons

### Backend
- Flask 2.2.2
- SQLAlchemy 2.0.23
- Flask-SQLAlchemy
- SQLite Database

## 📁 Project Structure

```
src/
├── components/
│   ├── customers/      # Customer management
│   ├── products/       # Product catalog
│   ├── orders/         # Order processing
│   └── common/         # Shared components
├── context/           # Global state management
├── hooks/             # Custom React hooks
├── services/          # API services
└── utils/            # Helper functions
```

## 🔗 Backend Integration

This project connects to the Module 6 Mini-Project backend. You can find the backend code here:
[Module 6 Backend Project](https://github.com/Anon23261/Module6-Mini-Project.git)

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📝 License

[MIT](https://choosealicense.com/licenses/mit/)

## Contact

Your Name - [your-email@example.com]

Project Link: [https://github.com/yourusername/e-commerce-react]
