# AssetFlow — Product Requirements Document (PRD)

| | |
|---|---|
| **Product** | AssetFlow — Enterprise Asset & Resource Management System |
| **Version** | 1.0 (Hackathon MVP) |
| **Stack** | MERN — MongoDB, Express.js, React.js, Node.js |
| **Team size** | 3 |
| **Timebox** | 6 hours remaining, backend-first then frontend |

---

## 1. Overview
AssetFlow is an ERP module for organizations to track, allocate, book, maintain, and audit physical assets and shared resources (equipment, furniture, vehicles, rooms) — replacing spreadsheets/paper logs with a centralized, role-based platform. **Out of scope: purchasing, invoicing, accounting.**

## 2. Problem Statement
Organizations lose visibility into who holds what asset, where it is, and its condition. AssetFlow provides: department/category/employee setup, a defined asset lifecycle, conflict-safe allocation, overlap-safe resource booking, approval-gated maintenance, audit cycles with auto discrepancy reports, and a notification/KPI dashboard. Signup creates an Employee only; an Admin promotes people to Department Head / Asset Manager from the Employee Directory — no self-elevated roles.

## 3. Objectives & Success Criteria
- End-to-end demoable flow: register asset → allocate → (or) book → raise/approve maintenance → basic audit
- **No double-allocation** and **no overlapping bookings**, enforced server-side, not just UI
- Role-based access enforced on every protected route
- All 3 members commit to GitHub **every hour**, each pushing distinct, attributable work on their own module/branch

## 4. Scope
**In scope (MVP, 6 hrs):** Auth + role promotion, Org Setup (departments/categories/employees), Asset registration/directory, Allocation + transfer, Resource booking + overlap check, Maintenance workflow (simplified), Dashboard KPIs.

**Out of scope / stretch only if time allows:** Full audit cycle module, Reports/Analytics exports, Notifications feed, Activity log UI, Technician-Assigned/In-Progress maintenance sub-states (collapse to Pending → Approved/Rejected → Resolved).

## 5. User Roles
| Role | Core permissions |
|---|---|
| **Admin** | Manage departments/categories, promote roles, full visibility |
| **Asset Manager** | Register/allocate assets, approve transfers & maintenance |
| **Department Head** | Approve allocation/transfer within dept, book for dept, view dept assets |
| **Employee** | View own allocations, book resources, raise maintenance, request transfer/return |

## 6. Key User Stories
- As an **Employee**, I sign up and get an account with no role selection, so only Admins control elevated access.
- As an **Admin**, I promote an Employee to Asset Manager from the directory, so role changes are auditable and centralized.
- As an **Asset Manager**, when I try to allocate an asset already held by someone, I'm blocked and shown who holds it, with a Transfer Request option instead.
- As an **Employee**, when I book Room B2 for a slot that overlaps an existing booking, my request is rejected; a back-to-back slot succeeds.
- As an **Asset Manager**, an asset only flips to "Under Maintenance" once I approve the request, not when it's raised.

## 7. Functional Modules
| Module | Core functionality |
|---|---|
| Auth | Employee-only signup, login (JWT), forgot password, session validation |
| Org Setup (Admin) | CRUD departments (hierarchy, head, status), asset categories (+custom fields), employee directory + role promotion |
| Asset Directory | Register (auto tag `AF-0001`, serial/QR, acquisition data, condition, location, photos, bookable flag), search/filter, per-asset history |
| Allocation & Transfer | Allocate (block if already held), return w/ condition notes, transfer Requested→Approved→Reallocated, auto-flag overdue |
| Resource Booking | Calendar per resource, overlap validation, status Upcoming/Ongoing/Completed/Cancelled, cancel/reschedule |
| Maintenance | Raise (issue, priority, photo), Pending→Approved/Rejected→Resolved, asset status auto-updates |
| Dashboard | KPI cards: Available, Allocated, Maintenance Today, Active Bookings, Pending Transfers, Upcoming Returns |
| *(Stretch)* Audit | Cycle creation, auditor assignment, Verified/Missing/Damaged, discrepancy report, close cycle |

## 8. Data Model (MongoDB / Mongoose)
| Collection | Key fields |
|---|---|
| **users** | name, email (unique), passwordHash, role (Employee/DeptHead/AssetManager/Admin), department (ref Department), status |
| **departments** | name, parent (ref Department, self-ref), head (ref User), status |
| **assetcategories** | name, customFields (Mixed/JSON) |
| **assets** | assetTag (auto, unique), name, category (ref AssetCategory), serialNumber, qrCode, acquisitionDate, acquisitionCost, condition, location, department (ref Department), status (Available/Allocated/Reserved/UnderMaintenance/Lost/Retired/Disposed), isBookable, photoUrl, documentUrls [String] |
| **allocations** | asset (ref Asset), employee (ref User), allocatedDate, expectedReturnDate, actualReturnDate, conditionCheckIn, status (Active/Returned/Overdue) |
| **transferrequests** | asset (ref Asset), fromUser (ref User), toUser (ref User), requestedBy (ref User), approvedBy (ref User), status (Requested/Approved/Rejected/Reallocated) |
| **resourcebookings** | asset (ref Asset), bookedBy (ref User), startTime, endTime, status (Upcoming/Ongoing/Completed/Cancelled) |
| **maintenancerequests** | asset (ref Asset), raisedBy (ref User), issue, priority, photoUrl, status (Pending/Approved/Rejected/Resolved), approvedBy (ref User) |
| **auditcycles**, **audititems** *(stretch)* | scope, dates, status; per-asset result (Verified/Missing/Damaged) |

Use `ObjectId` refs (not embedding) for all cross-collection links above — keeps allocation/booking conflict queries simple with `.find()` + `$or` overlap filters.

## 9. Workflows (state chains)
- **Asset lifecycle**: Available → Allocated / Reserved / UnderMaintenance → Available; → Lost (audit); Available → Retired → Disposed
- **Maintenance (MVP)**: Pending → Approved / Rejected → Resolved
- **Transfer**: Requested → Approved / Rejected → Reallocated
- **Booking**: Upcoming → Ongoing → Completed; Upcoming → Cancelled

## 10. Business Rules
1. **No double-allocation**: before creating an allocation, query for an existing `status: Active` allocation on that asset; if found, reject (409) with `heldBy`, offer Transfer Request. *Test: Priya holds AF-0114 → Raj's allocation attempt is blocked.*
2. **No overlapping bookings**: reject if `newStart < existingEnd AND newEnd > existingStart` for any non-cancelled booking on that asset; back-to-back allowed. *Test: Room B2 booked 9–10 → 9:30–10:30 rejected, 10–11 allowed.*
3. Asset status → `UnderMaintenance` only on maintenance **Approved**; → `Available` only on **Resolved**.
4. Overdue = `expectedReturnDate < now()` and allocation `status: Active`.
5. Roles change only via Admin → Employee Directory; signup always creates `Employee`.
6. Asset Tag auto-generated sequentially (`AF-0001`…), generated atomically to avoid duplicate tags under concurrent inserts.

## 11. Tech Stack (MERN)
| Layer | Choice |
|---|---|
| Database | **MongoDB** (Atlas or local) |
| ODM | **Mongoose** |
| Backend | **Node.js + Express.js** (REST API) |
| Auth | **JWT** (httpOnly cookie or Bearer token) + **bcrypt** password hashing + role-check middleware |
| Frontend | **React.js (Vite)** |
| Styling | Tailwind CSS |
| Data fetching | Axios + React Query (or Context API if time-constrained) |
| Forms/validation | React Hook Form + a simple Joi/express-validator schema shared conceptually between FE/BE |
| Calendar (booking) | react-big-calendar |
| Charts (dashboard) | Recharts |
| File uploads | Multer (local) or Cloudinary if time allows |
| Deployment | Backend: Render/Railway · Frontend: Vercel/Netlify · DB: MongoDB Atlas |

## 12. Architecture
```
/backend
  /models      → Mongoose schemas (User, Department, Asset, Allocation, Booking, Maintenance, ...)
  /routes      → Express routers per resource
  /controllers → business logic incl. conflict rules (in DB transaction where possible)
  /middleware  → authMiddleware (JWT verify), roleMiddleware (RBAC)
  server.js    → app entry, mounts all routers
/frontend
  /src/pages       → Login, Dashboard, Assets, Allocation, Booking, Maintenance
  /src/components  → shared UI (KPI cards, tables, forms, calendar)
  /src/api         → axios instance + per-module API calls
  App.jsx          → routes
```

## 13. API Design (Express, REST under `/api`)
`auth`: signup, login, logout, forgot-password
`departments`, `categories`, `employees` (+ `/:id/promote`)
`assets` (+ `/:id/history`)
`allocations` (+ `/:id/return`, 409 on conflict)
`transfers` (+ approve/reject)
`bookings` (+ cancel/reschedule, 409 on overlap)
`maintenance` (+ approve/reject/resolve)
`dashboard/kpis`
*(stretch)* `audits`, `reports/*`, `notifications`

## 14. Non-Functional Requirements
Server-side RBAC on every mutating route · bcrypt + JWT auth · input validation on all endpoints · conflict checks (allocation/booking) run as atomic queries to avoid race conditions · indexes on `assetTag`, `serialNumber`, `status`, and `(asset, startTime, endTime)` on bookings · mobile-responsive UI.

## 15. Execution Plan — 3-Person Split (backend-first, 6 hrs)
| Owner | Module | Files |
|---|---|---|
| **A** | Auth + Org Setup + Dashboard shell | `models/User.js`, `models/Department.js`, `routes/authRoutes.js`, `routes/deptRoutes.js`, `middleware/auth.js` |
| **B** | Assets + Allocation | `models/Asset.js`, `models/Allocation.js`, `routes/assetRoutes.js`, `routes/allocationRoutes.js` |
| **C** | Booking + Maintenance | `models/Booking.js`, `models/Maintenance.js`, `routes/bookingRoutes.js`, `routes/maintenanceRoutes.js` |

Each person: own branch, **push every hour**, merge to `main` after backend is done (~hour 3) and again at the end. Shared files (`server.js`, `App.jsx`) get a 30-second manual line-add merge, not fought over.

| Hour | Focus |
|---|---|
| 1 | Mongoose models + CRUD routes for own module → push |
| 2 | Core logic: B = allocation conflict block, C = booking overlap check, A = JWT + RBAC + promote endpoint → push |
| 3 | Finish backend, test endpoints, **merge to main**, group-test auth across modules → push |
| 4 | React pages calling own APIs → push |
| 5 | Wire routing + real auth token + styling → push |
| 6 | Merge, full flow test, fix, final push, demo prep |

## 16. Suggested Name
**AssetFlow** (default, matches problem statement). Alternatives: AssetPilot, Vantage, AssetOrbit, Trackwell.
