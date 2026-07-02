# Banking Management System 💳

A secure and scalable backend banking system built using **Node.js, Express.js, and MongoDB**.  
This project includes authentication, account management, and full transaction handling features like deposit, withdrawal, and fund transfer.

---

## 🚀 Features

* Authentication & Security

* User Registration & Login
* JWT Authentication (Access & Refresh Tokens)
* Secure Password Hashing using bcrypt
*Protected Routes with Middleware
*Request Validation & Security Checks
*Centralized Error Handling


*Account Management

*Account Creation & Management
*Account Details Retrieval
*Account Status Validation
*Balance Calculation from Ledger Entries 

*Transaction Management

*Deposit Money
*Withdraw Money
*Fund Transfer Between Accounts
*Transaction History Tracking
*Custom Transaction Descriptions
*Transaction Status Tracking
*Pending
*Success
*Failed
*Reversed

*Ledger System

*Double Entry Ledger Architecture
*Credit / Debit Ledger Entries
*Immutable Transaction Records
*Full Transaction Audit Trail
*Ledger-Based Balance Calculation

* Fund Transfer Features
 
*Account-to-Account Transfers
*Self Transfer Prevention
*Idempotency Key Support
*Safe Transfer Processing
*Transfer Reference Tracking

*Return Request & Recovery System
 
*Create Return Requests for Incorrect Transfers
*Return Request Approval Workflow
*Return Request Rejection Workflow
*Partial Settlement Support
*Automatic Recovery of Pending Amounts
*Original Transaction Referencing
*Settlement Status Tracking
*Pending
*Partial
*Completed
*Expiry Handling for Return Requests
*Return Transaction History Tracking

*Database Reliability

*MongoDB Transactions (Session Support)
*Atomic Multi-Step Operations
*Consistent Ledger Updates
*Recovery-Safe Transaction Processing

---

## Key Banking Features

* Double-entry ledger architecture
* Transaction audit trail
* Account-to-account fund transfers
* Idempotent transfer requests
* Self-transfer protection
* Credit and debit transaction tracking
* Historical transaction records
* Balance derived from ledger entries



## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Token)
- Bcrypt.js
- Dotenv

---


🏦 Banking Concepts Implemented

Double Entry Accounting
Ledger-Based Balance Calculation
Transaction Audit Trail
Idempotent Transfers
Account Validation
Transfer Recovery Workflow
Partial Fund Settlement
Immutable Financial Records
Atomic Banking Transactions

📌 Core Modules

Authentication Module
Account Management Module
Deposit & Withdrawal Module
Fund Transfer Module
Ledger Engine
Transaction Management Module
Return Request System
Settlement Processing Engine
Error Handling Middleware

🔮 Future Enhancements

Scheduled Settlement Jobs (Cron)
Account Statements (PDF Export)
Beneficiary Management
Transaction Notifications
UPI-Style Payment Requests
Admin Dashboard
Fraud Detection Rules
Multi-Currency Support

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




