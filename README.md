# Bug Tracking System — Claros Analytics

A full-stack Bug Tracking System built with **React + TypeScript** (frontend) and **.NET 9 Web API** (backend), using **SQL Server**, **Entity Framework Core (Code-First)**, **ASP.NET Core Identity**, and **JWT Authentication**.

---

## Features

### User Management
- Register as **User** or **Developer**
- JWT-based login/authentication
- Role-based access control (User vs Developer)

### Bug Reporting (User & Developer)
- Report bugs with title, description, severity, and reproduction steps
- Attach files (screenshots, logs) to bugs
- View your own reported bugs

### Bug Assignment (Developer only)
- Browse unassigned bugs with search
- Assign bugs to yourself from the unassigned list
- Update status of assigned bugs (Open → In Progress → Resolved → Closed)

### Architecture
- Clean separation of concerns: Controllers → Services → Repositories (via EF Core)
- Dependency Injection throughout
- Global exception handling middleware
- Code-First EF Core with migrations
- Swagger UI for API testing

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Redux Toolkit |
| Backend | .NET 9, ASP.NET Core Web API |
| Auth | ASP.NET Core Identity + JWT Bearer |
| ORM | Entity Framework Core 9 (Code-First) |
| Database | SQL Server |
| Docs | Swagger / OpenAPI |

---

## Project Structure

```
BugTracker/
├── BugTracker.API/              ← .NET 9 Backend
│   ├── Controllers/
│   │   ├── AuthController.cs    ← Register, Login
│   │   └── BugsController.cs    ← CRUD, Assign, Status, Attachments
│   ├── Data/
│   │   └── AppDbContext.cs      ← EF Core DbContext
│   ├── DTOs/
│   │   └── Dtos.cs              ← All request/response records
│   ├── Middleware/
│   │   └── ExceptionMiddleware.cs
│   ├── Models/
│   │   ├── AppUser.cs
│   │   ├── Bug.cs
│   │   └── BugAttachment.cs
│   ├── Services/
│   │   ├── IServices.cs         ← Interfaces
│   │   ├── AuthService.cs       ← JWT generation, Identity
│   │   └── BugService.cs        ← Bug business logic
│   ├── appsettings.json
│   └── Program.cs               ← DI, JWT, Identity, Swagger, CORS
│
└── BugTracker.Frontend/         ← React Frontend
    └── src/
        ├── components/
        │   ├── Navbar.tsx
        │   └── Badge.tsx
        ├── hooks/
        │   └── redux.ts
        ├── pages/
        │   ├── LoginPage.tsx
        │   ├── RegisterPage.tsx
        │   ├── Dashboard.tsx
        │   ├── BugsPage.tsx
        │   ├── ReportBugPage.tsx
        │   ├── MyBugsPage.tsx
        │   └── UnassignedPage.tsx
        ├── services/
        │   └── api.ts           ← Axios + JWT interceptor
        ├── store/
        │   ├── index.ts
        │   ├── authSlice.ts
        │   └── bugsSlice.ts
        └── App.tsx              ← Routes + Protected layout
```

---

## Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js >= 16](https://nodejs.org/)
- [SQL Server](https://www.microsoft.com/en-us/sql-server) (local or Express)
- [EF Core CLI tools](https://learn.microsoft.com/en-us/ef/core/cli/dotnet)

---

### Backend Setup

```bash
# 1. Navigate to API project
cd BugTracker.API

# 2. Install EF Core CLI (if not already installed)
dotnet tool install --global dotnet-ef

# 3. Restore packages
dotnet restore

# 4. Update the connection string in appsettings.json
#    Default: Server=localhost;Database=BugTrackerDb;Trusted_Connection=True;TrustServerCertificate=True;

# 5. Run database migrations (creates DB + tables automatically)
dotnet ef migrations add InitialCreate
dotnet ef database update

# 6. Run the API
dotnet run
```

API will be available at: **http://localhost:55578**
Swagger UI at: **http://localhost:55578/swagger**

---

### Frontend Setup

```bash
# 1. Navigate to frontend project
cd BugTracker.Frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
```

Frontend will be available at: **http://localhost:3000**

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login and get JWT |

### Bugs
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/api/bugs` | ✅ | Any | Get all bugs (with optional `?search=`) |
| GET | `/api/bugs/{id}` | ✅ | Any | Get bug by ID |
| GET | `/api/bugs/my` | ✅ | Any | Get my reported bugs |
| GET | `/api/bugs/unassigned` | ✅ | Developer | Get unassigned bugs |
| GET | `/api/bugs/developers` | ✅ | Developer | Get list of all developers (for assignment) |
| POST | `/api/bugs` | ✅ | Any | Report a new bug |
| PUT | `/api/bugs/{id}/assign` | ✅ | Developer | Assign bug to self |
| PUT | `/api/bugs/{id}/status` | ✅ | Developer | Update bug status |
| POST | `/api/bugs/{id}/attachments` | ✅ | Any | Upload file attachment |

---

## Default Roles

When you register, choose:
- **User** — Can report bugs and view their own reports
- **Developer** — Can view unassigned bugs, assign them to self, and update status

---

## Configuration

Edit `BugTracker.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "Default": "Server=localhost;Database=BugTrackerDb;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "BugTrackerSuperSecretKey2026!!ClarosAnalytics",
    "Issuer": "BugTrackerAPI",
    "Audience": "BugTrackerClient"
  }
}
```

---

## Git Workflow

```
main
└── feature/auth-identity
└── feature/bug-reporting
└── feature/bug-assignment
└── feature/file-attachments
└── feature/frontend-ui
```

---

## Author

**Shristi** — Full-Stack Developer Assignment
Submitted to: Claros Analytics
