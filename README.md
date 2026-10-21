# ⛽ Petrol Station Sales & Stock System

A full-stack web application designed to help petrol station administrators manage daily fuel sales, monitor stock levels, reconcile fuel inventory, and identify shortages or surpluses.

The system uses a **three-tier architecture** with React for the frontend, Node.js and Express for the backend, and MySQL for database management.

---

## ✨ Features

- 🔐 **Secure Authentication** — User authentication using JSON Web Tokens (JWT) and bcrypt password hashing.
- 📊 **Dashboard Analytics** — Displays key performance indicators (KPIs) and color-coded fuel tank level indicators.
- ⛽ **Daily Data Entry** — Records pump meter readings, physical tank dips, and fuel deliveries.
- 📦 **Stock Reconciliation** — Calculates expected fuel stock and compares it with actual physical measurements to identify shortages or surpluses.
- 📑 **Daily Reports** — Generates daily sales reports with CSV export and print-to-PDF functionality.
- 📝 **Audit Logs** — Tracks user actions to support accountability and monitoring.

### How Stock Reconciliation Works

The system calculates expected fuel stock using the following formula:

```text
Expected Stock = Opening Stock + Deliveries - Fuel Sold

Stock Variance = Actual Stock - Expected Stock
```

A negative variance indicates a shortage, while a positive variance indicates a surplus.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| Vite | Frontend development server and build tool |
| Tailwind CSS | Styling and responsive layouts |
| Node.js | Backend runtime |
| Express.js | REST API and server-side logic |
| MySQL | Relational database |
| XAMPP | Local database environment |
| JWT | Authentication |
| bcrypt | Password hashing |
| Git and GitHub | Version control and project hosting |

---

## 📋 Prerequisites

Install the following software before setting up the project:

- [Node.js](https://nodejs.org/) — Version 18 or later
- [XAMPP](https://www.apachefriends.org/) — For MySQL and phpMyAdmin
- [Git](https://git-scm.com/) — For cloning the repository
- [Visual Studio Code](https://code.visualstudio.com/) — Recommended code editor

---

## ⚙️ Installation & Setup

Follow the steps below to run the application locally on your computer.

### Step 1: Clone the Repository

Open PowerShell or your preferred terminal and run:

```bash
git clone https://github.com/joy-gatimu/Petrol-system.git
cd Petrol-system
```

### Step 2: Set Up the Database

1. Open XAMPP Control Panel.
2. Start **Apache** and **MySQL**.
3. Open [http://localhost/phpmyadmin](http://localhost/phpmyadmin) in your browser.
4. Select the **SQL** tab.
5. Open `database/schema.sql` from the project directory in Visual Studio Code.
6. Copy the SQL script and paste it into the phpMyAdmin SQL editor.
7. Click **Go** to execute the script.

The script is intended to create the database and required tables, along with initial records for the default administrator, fuel types, tanks, pumps, and an initial full tank dip.

### Step 3: Configure the Backend

Open a terminal and navigate to the backend directory:

```powershell
cd backend
npm install
```

Create a file named `.env` inside the `backend` folder and add the following configuration:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=petrol_station_db

JWT_SECRET=my_super_secret_key_123
```

**Note:** If your MySQL installation uses a password, enter it after `DB_PASSWORD=`.

Replace the example JWT secret with a strong, private value before using the application beyond local development.

Start the backend server:

```bash
npm run dev
```

If everything is configured correctly, you should see messages similar to:

```text
Connected to MySQL Database
Server running on port 5000
```

Keep this terminal open while using the application.

### Step 4: Start the Frontend

Open a **second terminal window** and navigate to the frontend directory:

```powershell
cd frontend
npm install
```

Start the React development server:

```bash
npm run dev
```

Vite should display a local URL, typically:

[http://localhost:5173](http://localhost:5173)

Keep this terminal open as well.

---

## 🔐 Login Credentials

Open the application in your browser:

**Application URL:** [http://localhost:5173](http://localhost:5173)

| Field | Credentials |
|---|---|
| Username | `admin` |
| Password | `admin123` |

These credentials assume the database setup creates the default administrator account successfully.

> **Security note:** The credentials above are for local testing only. Change the default password before deploying the application or using it with real business data.

---

## 📂 Project Structure

```text
Petrol-system/
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── master.js
│   │   │   ├── readings.js
│   │   │   └── reconciliation.js
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

- **`backend/`** — Contains the Express server, API routes, database connection, and backend logic.
- **`database/`** — Contains the SQL schema and initial database records.
- **`frontend/`** — Contains the React interface, reusable components, application pages, and API integration.
- **`README.md`** — Contains project documentation and setup instructions.

---

## 🛠️ Troubleshooting

| Problem | Possible Solution |
|---|---|
| Blank white screen | Open browser developer tools with `F12` and check the Console for JavaScript errors or missing imports. |
| Invalid username or password | Confirm that MySQL is running, `schema.sql` executed successfully, and the credentials match the seeded administrator account. |
| Failed to fetch | Check that the backend is running on port `5000` and verify the frontend API URL and CORS configuration. |
| Tailwind CSS/PostCSS error | Check the installed Tailwind CSS version and ensure the configuration matches that version. |
| Fuel tanks show 0% | Verify that the initial tank dip records were inserted successfully by `schema.sql`. |
| Database connection error | Check the MySQL service, database name, username, password, and `.env` configuration. |
| Port already in use | Stop the process using the port or configure the application to use another port. |

---

## 🎯 Project Objective

The purpose of this project is to improve petrol station operations through centralized fuel stock monitoring, daily sales recording, inventory reconciliation, and reporting.

By helping administrators identify discrepancies between expected and actual fuel stock, the system supports better accountability, more accurate records, and informed operational decisions.

---

**Project Name:** Petrol Station Sales & Stock System

**Repository:** [Petrol-system on GitHub](https://github.com/joy-gatimu/Petrol-system)

