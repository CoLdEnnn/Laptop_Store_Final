# Laptop_Store_Final

## Project Overview 
This project is a full-stack e-commerce platform for selling laptops. It features a RESTful API, a secure authentication system using JWT, and a powerful analytics dashboard for administrators based on MongoDB Aggregation Framework.

## System Architecture
- **Frontend**: Static HTML, CSS, and JavaScript using the Fetch API for server communication.
- **Backend**: Node.js and Express.js handling business logic and routing.
- **Database**: MongoDB Atlas for persistent data storage, managed via Mongoose.
- **Security**: JWT-based authentication and authorization middleware to protect sensitive routes.

## API Documentation
### Auth Routes
- `POST /api/auth/register` - Register a new user.
- `POST /api/auth/login` - Login and receive a JWT token.

### Laptop Routes
- `GET /api/laptops` - Get all products.
- `GET /api/laptops/:id` - Get specific laptop details.
- `POST /api/laptops` - (Admin only) Add a new laptop.

### Stats Routes (Admin Only)
- `GET /api/stats/inventory-by-brand` - Get stock analytics.
- `GET /api/stats/revenue-by-brand` - Get sales revenue analytics.
