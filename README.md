# AssetFlow

**Enterprise Asset & Resource Management System**

AssetFlow is a centralized, role-based platform designed for organizations to track, allocate, book, maintain, and audit physical assets and shared resources (such as equipment, furniture, vehicles, and rooms). It replaces inefficient spreadsheets and paper logs with a streamlined, conflict-free management system.

## Key Features

- **Role-Based Access Control (RBAC):** Secure authentication and authorization with distinct roles (Admin, Asset Manager, Department Head, Employee). Admin role handles employee promotions centrally.
- **Asset Lifecycle Management:** Track assets comprehensively from registration to allocation, maintenance, and disposal.
- **Conflict-Safe Allocation:** Prevents double-allocation of assets with robust server-side validation.
- **Resource Booking:** Calendar-based booking for shared resources with built-in overlap prevention.
- **Maintenance Workflows:** Streamlined process for raising, approving, and resolving maintenance requests, with automatic asset status updates.
- **Dashboard & KPIs:** Real-time visibility into asset availability, active allocations, pending maintenance, and upcoming returns.

## Technologies Used

- **Frontend:** React.js (Vite), Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (with Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens) and bcrypt

## Project Structure

The project is structured as a monorepo containing both the frontend and backend applications.

```text
AssetFlow/
├── backend/       # Node.js & Express.js REST API
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
└── frontend/      # React.js application
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── pages/
    │   └── App.jsx
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas cluster)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd AssetFlow
   ```

2. **Setup the Backend:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory based on `.env.example` with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

3. **Setup the Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```
   If required, create a `.env` file in the `frontend` directory to define the API base URL:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### Running the Application

1. **Start the Backend Server:**
   Open a new terminal and run:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend Development Server:**
   Open another terminal and run:
   ```bash
   cd frontend
   npm run dev
   ```

The frontend application will be available at `http://localhost:5173` (or the port specified by Vite), and the backend API will run on `http://localhost:5000`.
