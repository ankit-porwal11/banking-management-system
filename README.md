# Banking Management System 💳

A secure and scalable backend banking system built using **Node.js, Express.js, and MongoDB**.  
This project includes authentication, account management, and full transaction handling features like deposit, withdrawal, and fund transfer.

---

## 🚀 Features

- User Registration & Login
- JWT Authentication (Access & Refresh Tokens)
- Secure Password Hashing
- Account Creation & Management
- Deposit Money
- Withdraw Money
- Fund Transfer Between Accounts
- Transaction History Tracking
- RESTful API Architecture
- Error Handling & Validation

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Token)
- Bcrypt.js
- Dotenv

---

## 📁 Project Structure

src/
│── controllers/
│── models/
│── routes/
│── middleware/
│── db/
│── utils/
│── app.js
│── index.js


---

## ⚙️ Installation & Setup

### 1. Clone the repository
``bash

git clone https://github.com/your-username/banking-management-system.git

2. Install dependencies

npm install

3. Create .env file

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

4. Run the project

npm start

📡 API Endpoints

Auth Routes
POST /api/auth/register
POST /api/auth/login
Account Routes
POST /api/account/create
POST /api/account/deposit
POST /api/account/withdraw
POST /api/account/transfer
GET  /api/account/transactions

🔐 Security Features

Password hashing using bcrypt
JWT-based authentication
Protected routes middleware
Secure transaction handling


👨‍💻 Author

Ankit Porwal




