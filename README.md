# ⛽ Petrol Station Sales & Stock Management System

A full-stack web application designed to help petrol station administrators manage daily fuel sales, monitor stock levels, reconcile cash collections, and detect fuel shortages or surpluses.

The system follows a **three-tier architecture** consisting of a React frontend, a Node.js/Express backend, and a MySQL database.

## 📋 Table of Contents

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Prerequisites](#-prerequisites)
4. [Installation Guide](#-installation-guide)
5. [Database Setup](#-database-setup)
6. [Running the Project](#-running-the-project)
7. [Test Credentials](#-test-credentials)
8. [Project Structure](#-project-structure)
9. [Troubleshooting](#-troubleshooting)

---

## 🚀 Features

- **🔐 Secure Authentication:** Role-based login for Super Admins, Admins, and Attendants using JWT authentication and bcrypt password hashing.
- **📊 Dashboard Analytics:** Displays key performance indicators (KPIs), seven-day sales trends, and fuel tank levels.
- **⛽ Daily Data Entry:** Records pump meter readings, physical tank dips, and fuel deliveries.
- **📦 Stock Reconciliation:** Calculates expected fuel stock using opening stock, deliveries, and fuel sold, then compares it with actual physical stock to identify shortages or surpluses.
- **💰 Cash Reconciliation:** Compares expected sales with actual cash, M-Pesa, and card collections to identify discrepancies.
- **📑 Reporting:** Generates daily and monthly reports with CSV export and print-to-PDF functionality.

## 🛠️ Tech Stack

| Component           | Technology                   |
| ------------------- | ---------------------------- |
| Frontend            | React.js, Vite, Tailwind CSS |
| Data Visualization  | Recharts                     |
| Backend             | Node.js, Express.js          |
| Database            | MySQL                        |
| Database Management | XAMPP, phpMyAdmin            |
| Authentication      | JSON Web Tokens (JWT)        |
| Password Security   | bcrypt                       |
| Version Control     | Git and GitHub               |

## 📋 Prerequisites

Before running the project, ensure the following software is installed:

1. [Node.js](https://nodejs.org/) — Version 18 or later
2. [XAMPP](https://www.apachefriends.org/) — For MySQL database management
3. [Git](https://git-scm.com/) — For cloning the repository
4. [Visual Studio Code](https://code.visualstudio.com/) — Recommended code editor

## ⚙️ Installation Guide

### Step 1: Clone the Repository

Open PowerShell, Command Prompt, or Git Bash and run:

```bash
git clone https://github.com/joy-gatimu/Petrol-system.git
cd Petrol-system
```

### Step 2: Install Dependencies

Install the frontend and backend dependencies separately when setting up each part of the application. Instructions are provided in the [Running the Project](#-running-the-project) section.

## 💾 Database Setup

1. Open XAMPP and start **Apache** and **MySQL**.
2. Open your browser and navigate to [http://localhost/phpmyadmin](http://localhost/phpmyadmin).
3. Select the **SQL** tab.
4. Open `database/schema.sql` in Visual Studio Code.
5. Copy the contents of the file and paste them into the SQL editor in phpMyAdmin.
6. Click **Go** to execute the script.

The SQL script is intended to create the database, its ten tables, and the initial records for the default administrator, fuel types, tanks, pumps, and suppliers.

## 🚀 Running the Project

The frontend and backend must run in **two separate terminal windows**.

### Terminal 1: Start the Backend

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create a file named `.env` inside the `backend` directory and add the following configuration:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=petrol_station_db

JWT_SECRET=my_super_secret_key_123
```

**Important:** If your MySQL server uses a password, enter it after `DB_PASSWORD=`. Replace the example JWT secret with a strong, private value before using the application beyond local testing.

Start the backend server:

```bash
npm run dev
```

If the configuration is correct, the terminal should display messages similar to:

```text
Connected to MySQL Database
Server running on port 5000
```

### Terminal 2: Start the Frontend

Open a second terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
npm install recharts
npm run dev
```

Once Vite starts, open the local URL displayed in the terminal. It will typically be:

[http://localhost:5173](http://localhost:5173)

## 🔐 Test Credentials

Open the application in your browser:

[http://localhost:5173](http://localhost:5173)

Use the following credentials to test the default administrator account, provided the database seed data creates it as described.

| Field    | Value      |
| -------- | ---------- |
| Username | `admin`    |
| Password | `admin123` |

**Security note:** These are development credentials. Change the default password before deploying the application or using it with real business data.

## 📂 Project Structure

The project is organized into separate frontend, backend, and database directories.

```text
Petrol-system/
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth
│   │   │   ├── master
│   │   │   ├── readings
│   │   │   └── reconciliation
│   │   ├── db.js
│   │   └── server.js
│   ├── .env
│   └── package.json
│
├── database/
│   └── schema.sql
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.js
│   │   └── App.jsx
│   └── package.json
│
└── README.md
```

### Directory Overview

- **`backend/`** — Contains the Express server, API routes, database connection, and authentication logic.
- **`database/`** — Contains the SQL schema and initial database records.
- **`frontend/`** — Contains the React application, reusable components, pages, and API integration.
- **`README.md`** — Provides project documentation and setup instructions.

## 🛠️ Troubleshooting

| Problem                      | Possible Solution                                                                                                    |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Blank white screen           | Open the browser developer tools using `F12` and check the Console for JavaScript errors or missing imports.         |
| Invalid username or password | Confirm that MySQL is running, `schema.sql` was executed successfully, and the credentials match the seeded account. |
| Failed to fetch              | Ensure the backend is running on port `5000` and check the frontend's API URL and CORS configuration.                |
| Tailwind CSS/PostCSS error   | Check the installed Tailwind CSS version and ensure the PostCSS configuration matches that version.                  |
| Dashboard shows zeros        | Check whether the database contains records for the selected date, particularly today's date.                        |
| Database connection error    | Verify the database name, username, password, and MySQL service status in XAMPP.                                     |
| Port already in use          | Stop the other process using the port or configure the application to use a different port.                          |

---

## 🎯 Project Objective

The main objective of this project is to improve petrol station operations by providing a centralized system for recording sales, monitoring fuel inventory, reconciling financial collections, and generating reports.

By combining fuel stock tracking with cash reconciliation, the system helps administrators identify discrepancies early and make better operational decisions.

---



**Project:** Petrol Station Sales & Stock Management System
