# AssetFlow Backend

An ERP module for tracking, allocating, booking, and maintaining organizational assets.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (httpOnly cookies + Bearer tokens) + bcrypt

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)

### Installation

```bash
cd backend
npm install
```

### Configuration

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/assetflow` |
| `JWT_SECRET` | Secret key for signing JWTs | *(change this!)* |
| `JWT_EXPIRES_IN` | Token expiry duration | `7d` |

### Run

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

## API Endpoints

All routes are mounted under `/api`.

| Prefix | Resource | Auth |
|---|---|---|
| `/api/auth` | Signup, Login, Logout, Forgot Password | Public |
| `/api/employees` | Employee directory, Role promotion | Protected |
| `/api/departments` | Department CRUD | Protected (Admin write) |
| `/api/categories` | Asset category CRUD | Protected (Admin write) |
| `/api/assets` | Asset CRUD, History | Protected |
| `/api/allocations` | Allocate / Return assets | Protected |
| `/api/transfers` | Transfer requests | Protected |
| `/api/bookings` | Resource bookings | Protected |
| `/api/maintenance` | Maintenance requests | Protected |
| `/api/dashboard` | KPI aggregation | Protected |

### Health Check

```
GET /api/health
```

## Roles & Permissions

| Role | Capabilities |
|---|---|
| **Admin** | Full access — manage departments, categories, promote roles |
| **Asset Manager** | Register/allocate assets, approve transfers & maintenance |
| **Department Head** | Approve within own department, book for department |
| **Employee** | View own allocations, book resources, raise maintenance |

## Project Structure

```
backend/
├── controllers/    # Business logic per resource
├── middleware/      # Auth, RBAC, validation, async handler
├── models/         # Mongoose schemas
├── routes/         # Express routers
├── server.js       # App entry point
├── .env.example    # Environment template
└── package.json
```

## License

ISC
