# TransitOps — Smart Transport Operations Platform
 
> **Stack:** Next.js 15 (App Router) · TypeScript · PostgreSQL · Prisma · Tailwind CSS · shadcn/ui · Auth.js · Recharts

---

## 1. Business Context

Many logistics companies still rely on spreadsheets and manual logbooks to manage their transport operations. This leads to:
- Scheduling conflicts and underutilized vehicles
- Missed maintenance and expired driver licenses
- Inaccurate expense tracking
- Poor operational visibility

**TransitOps** is a centralized platform that manages the complete lifecycle of transport operations — from vehicle registration and driver management to dispatching, maintenance, fuel logging, and analytics.

---

## 2. Target Users (Roles)

| Role | Responsibilities |
|---|---|
| **Fleet Manager** | Oversees fleet assets, maintenance, vehicle lifecycle, and operational efficiency |
| **Dispatcher** | Creates trips, assigns vehicles and drivers, monitors active deliveries |
| **Safety Officer** | Ensures driver compliance, tracks license validity, monitors safety scores |
| **Financial Analyst** | Reviews operational expenses, fuel consumption, maintenance costs, profitability |

---

## 3. Functional Requirements

### 3.1 Authentication
- Secure login using email and password
- Role-Based Access Control (RBAC) — 4 roles
- Only authenticated users can access the application

### 3.2 Dashboard KPIs
- Active Vehicles
- Available Vehicles
- Vehicles in Maintenance
- Active Trips
- Pending Trips
- Drivers On Duty
- Fleet Utilization (%)
- Filters by vehicle type, status, and region

### 3.3 Vehicle Registry
| Field | Notes |
|---|---|
| Registration Number | Unique |
| Vehicle Name/Model | — |
| Type | Truck, Van, Car, etc. |
| Maximum Load Capacity | kg |
| Odometer | km |
| Acquisition Cost | currency |
| Status | Available \| On Trip \| In Shop \| Retired |

### 3.4 Driver Management
| Field | Notes |
|---|---|
| Name | — |
| License Number | — |
| License Category | A, B, C, D, etc. |
| License Expiry Date | — |
| Contact Number | — |
| Safety Score | 0–100 |
| Status | Available \| On Trip \| Off Duty \| Suspended |

### 3.5 Trip Management
- Create trip: source, destination, vehicle (available only), driver (available only), cargo weight, planned distance
- Trip lifecycle: `Draft → Dispatched → Completed → Cancelled`

### 3.6 Maintenance
- Create maintenance records for vehicles
- Adding to Maintenance Log → vehicle status = `In Shop` (hidden from dispatch)
- Closing maintenance → vehicle status = `Available` (unless `Retired`)

### 3.7 Fuel & Expense Management
- Record fuel logs: liters, cost, date
- Record other expenses: tolls, maintenance
- Auto-compute total operational cost per vehicle (Fuel + Maintenance)

### 3.8 Reports & Analytics
- Fuel Efficiency = Distance / Fuel (km/L)
- Fleet Utilization (%)
- Operational Cost per vehicle
- Vehicle ROI = `(Revenue − (Maintenance + Fuel)) / Acquisition Cost`
- CSV export (mandatory), PDF export (bonus)

---

## 4. Mandatory Business Rules

| # | Rule |
|---|---|
| BR-01 | Vehicle registration number must be unique |
| BR-02 | Retired or In Shop vehicles must NEVER appear in dispatch selection |
| BR-03 | Drivers with expired licenses or Suspended status cannot be assigned to trips |
| BR-04 | A driver or vehicle already On Trip cannot be assigned to another trip |
| BR-05 | Cargo Weight must not exceed the vehicle's maximum load capacity |
| BR-06 | Dispatching a trip → vehicle & driver status = On Trip |
| BR-07 | Completing a trip → vehicle & driver status = Available |
| BR-08 | Cancelling a dispatched trip → vehicle & driver status = Available |
| BR-09 | Creating an active maintenance record → vehicle status = In Shop |
| BR-10 | Closing maintenance → vehicle status = Available (unless Retired) |

---

## 5. Example Workflow

```
Step 1: Register vehicle 'Van-05' (max capacity 500 kg) → Status: Available
Step 2: Register driver 'Alex' with valid driving license
Step 3: Create trip (Cargo Weight = 450 kg)
Step 4: System validates 450 kg ≤ 500 kg → dispatch allowed
Step 5: Vehicle & Driver status → On Trip
Step 6: Complete trip (enter final odometer + fuel consumed)
Step 7: Vehicle & Driver status → Available
Step 8: Create maintenance record (Oil Change) → Vehicle: In Shop (hidden from dispatch)
Step 9: Reports update operational cost + fuel efficiency
```

---

## 6. Database Entities

```
Users, Roles, Vehicles, Drivers, Trips, Maintenance Logs, Fuel Logs, Expenses
```

---

## 7. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Authentication | Auth.js (NextAuth v5) |
| Charts | Recharts |
| Validation | Zod |
| State Management | React Query / Zustand |

---

## 8. Mandatory Deliverables

- [x] Responsive web interface
- [x] Authentication with RBAC
- [x] CRUD for Vehicles and Drivers
- [x] Trip Management with validations
- [x] Automatic status transitions
- [x] Maintenance workflow
- [x] Fuel & Expense tracking
- [x] Dashboard with KPIs

## 9. Bonus Features

- [ ] Charts and visual analytics (Recharts)
- [ ] PDF export
- [ ] Email reminders for expiring licenses
- [ ] Vehicle document management
- [ ] Search, filters, and sorting
- [ ] Dark mode

---

## 10. Project Structure

```
transops/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Dashboard / KPIs
│   │   ├── vehicles/
│   │   ├── drivers/
│   │   ├── trips/
│   │   ├── maintenance/
│   │   ├── fuel/
│   │   ├── expenses/
│   │   └── reports/
│   ├── api/
│   │   ├── auth/
│   │   ├── vehicles/
│   │   ├── drivers/
│   │   ├── trips/
│   │   ├── maintenance/
│   │   ├── fuel/
│   │   ├── expenses/
│   │   └── reports/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── dashboard/
│   ├── vehicles/
│   ├── drivers/
│   ├── trips/
│   ├── maintenance/
│   ├── fuel/
│   └── reports/
├── lib/
│   ├── auth.ts                       # Auth.js config
│   ├── prisma.ts                     # Prisma client
│   ├── validations/                  # Zod schemas
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── types/
│   └── index.ts
├── middleware.ts                     # Auth + RBAC middleware
├── .env.local
├── next.config.ts
├── tailwind.config.ts
└── CONTEXT.md
```

---

## 11. Prisma Schema (Entity Relationships)

```prisma
// Key relationships:
// User → Role (many-to-one)
// Vehicle → Trip (one-to-many)
// Driver → Trip (one-to-many)
// Vehicle → MaintenanceLog (one-to-many)
// Vehicle → FuelLog (one-to-many)
// Trip → Expense (one-to-many)
```

---

## 12. Key API Routes

| Method | Route | Description |
|---|---|---|
| POST | /api/auth/login | Sign in |
| GET | /api/vehicles | List vehicles |
| POST | /api/vehicles | Create vehicle |
| PATCH | /api/vehicles/:id | Update vehicle |
| DELETE | /api/vehicles/:id | Delete vehicle |
| GET | /api/drivers | List drivers |
| POST | /api/drivers | Create driver |
| GET | /api/trips | List trips |
| POST | /api/trips | Create trip |
| PATCH | /api/trips/:id/dispatch | Dispatch trip |
| PATCH | /api/trips/:id/complete | Complete trip |
| PATCH | /api/trips/:id/cancel | Cancel trip |
| POST | /api/maintenance | Create maintenance record |
| PATCH | /api/maintenance/:id/close | Close maintenance |
| POST | /api/fuel | Log fuel entry |
| POST | /api/expenses | Log expense |
| GET | /api/reports/dashboard | Dashboard KPIs |
| GET | /api/reports/analytics | Analytics data |
| GET | /api/reports/export | CSV export |

---

## 13. Status Transition State Machines

### Vehicle Status
```
Available ──[Dispatch Trip]──► On Trip ──[Complete/Cancel Trip]──► Available
Available ──[Create Maintenance]──► In Shop ──[Close Maintenance]──► Available
Any ──[Retire]──► Retired (terminal, unless manually changed by Fleet Manager)
```

### Driver Status
```
Available ──[Dispatch Trip]──► On Trip ──[Complete/Cancel Trip]──► Available
Available ──[Off Duty]──► Off Duty ──[Return]──► Available
Any ──[Suspend]──► Suspended
```

### Trip Status
```
Draft ──[Dispatch]──► Dispatched ──[Complete]──► Completed
Draft ──[Cancel]──► Cancelled
Dispatched ──[Cancel]──► Cancelled (restores vehicle & driver)
```
