# POS Bakery - Branch Service

Welcome to the **Branch Service** repository for the POS Bakery Distributed System. 
This template acts as the base application for every single branch (e.g., Bekasi, Jakarta, Bandung, Semarang, Surabaya). It is responsible for handling its own local operations (CRUD for Materials, Products, Employees) and participating in cross-branch distributed transactions (Two-Phase Commit).

---

## 📋 Prerequisites

Before setting up this project, make sure your system has the following installed:
- **Node.js** (v18 or higher recommended)
- **npm** (Node Package Manager)
- **MongoDB Atlas** account (or a local MongoDB instance running)
- **Git**

---

## 🚀 Setup & Installation

### 1. Clone the Repository
Clone this template to create your specific branch instance.
```bash
git clone https://github.com/mzkhairy/pos-bakery-template.git branch-nama_cabang
cd branch-nama_cabang
```

### 2. Install Dependencies
Install all required npm packages:
```bash
npm install
```

---

## ⚙️ Environment Configuration

You need to set up your environment variables before running the service or seeding the database. 

1. Create a `.env` file in the root directory of the project:
   ```bash
   touch .env
   ```
2. Open the `.env` file and configure it based on your specific branch. Below is an example configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Branch Identity
BRANCH_ID=bekasi
BRANCH_CODE=BKS

# Database Configuration
# Ganti dengan URI MongoDB Atlas milik cabang Anda!
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>.mongodb.net/

# Coordinator Service
COORDINATOR_URL=http://localhost:5000

# 2PC Timeout Configuration
CAN_COMMIT_TIMEOUT_MS=5000
DO_COMMIT_TIMEOUT_MS=10000
```

> **IMPORTANT:** Ensure the `BRANCH_ID` strictly matches one of the supported branch keys (e.g., `bekasi`, `jakarta`, `bandung`, `semarang`, `surabaya`). This is critical for the seeding process.

---

## 🌱 Database Seeding

The application comes with a powerful seeding script that automatically populates your database with Master Data (Employees, Materials, Products) and Branch-Specific Inventory records based on your `BRANCH_ID` in the `.env` file.

To run the seeder:
```bash
npm run seed
```

**Expected Output:**
- Master data will be inserted or updated if it already exists.
- Inventory quantities will be automatically populated according to the specific branch you configured.
- The `reserved` field for the 2PC engine will be safely initialized to `0`.

---

## 🏃‍♂️ Running the Service

Once your environment is set up and the database is seeded, you can start the development server:

```bash
npm run dev
```
The server will start (e.g., `Server running on port 3001`) and wait for incoming API requests.

---

## 🔗 The Coordinator Service

This branch service does not work alone! To perform inter-branch distributed transactions (like transferring materials securely between branches), it relies on a central **Coordinator**. 

The Coordinator is the brain that orchestrates the **Two-Phase Commit (2PC)** protocol, ensuring that if money or stock leaves one branch, it safely arrives at the destination, or rolls back entirely if a failure occurs.

You can find the Coordinator repository and its setup guide here:  
👉 **[POS Bakery Coordinator Service](https://github.com/mzkhairy/pos-bakery-coordinator)**
