# AXIS Project Architecture & Implementation Plan

## 1. User Roles & Permission System (PostgreSQL Schema)

The database schema forms the foundation of AXIS, enabling seamless interactions across all three main roles:
1. **Super Admin**: Complete platform visibility, global configurations, club approvals.
2. **Club Admin**: Local management over specific clubs, event creation, attendance tracking.
3. **Student**: Event discovery, registration, club following, dashboard personalization.

### ER Diagram Logic (Core Entities)

```mermaid
erDiagram
    USERS ||--o{ CLUB_MEMBERS : has
    USERS ||--o{ EVENT_REGISTRATIONS : makes
    CLUBS ||--o{ CLUB_MEMBERS : includes
    CLUBS ||--o{ EVENTS : hosts
    CLUBS ||--o{ ANNOUNCEMENTS : publishes
    EVENTS ||--o{ EVENT_REGISTRATIONS : receives

    USERS {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        enum global_role "SUPER_ADMIN, STUDENT"
        timestamp created_at
    }

    CLUBS {
        uuid id PK
        string name UK
        string slug UK
        string mission_statement
        string logo_url
        string banner_url
        boolean is_active
        timestamp created_at
    }

    CLUB_MEMBERS {
        uuid id PK
        uuid user_id FK
        uuid club_id FK
        enum club_role "CLUB_ADMIN, MEMBER"
        timestamp joined_at
    }

    EVENTS {
        uuid id PK
        uuid club_id FK
        string title
        text description
        timestamp start_time
        timestamp end_time
        string location
        string poster_url
        int max_capacity
        boolean is_featured
        string status "UPCOMING, LIVE, COMPLETED, CANCELLED"
    }

    EVENT_REGISTRATIONS {
        uuid id PK
        uuid event_id FK
        uuid user_id FK
        string qr_hash UK
        boolean check_in_status
        timestamp check_in_time
        timestamp registered_at
    }

    ANNOUNCEMENTS {
        uuid id PK
        uuid club_id FK
        string title
        text content
        boolean is_public
        timestamp posted_at
    }
```

## 2. API Folder Structure (Node.js/Express)

To support maintainability and scalability, we employ a layered architecture (Routes -> Controllers -> Services -> Repositories/Models).

```text
AXIS-backend/
├── src/
│   ├── app.js                 # Express app initialization & root middleware
│   ├── server.js              # Server entry point
│   ├── config/                # Environment, DB credentials, JWT settings
│   │   ├── db.config.js
│   │   └── auth.config.js
│   ├── models/                # PostgreSQL Models (Sequelize/Knex)
│   │   ├── index.js           # DB connection & relationships setup
│   │   ├── User.js
│   │   ├── Club.js
│   │   ├── Event.js
│   │   ├── EventRegistration.js
│   │   └── ...
│   ├── routes/                # API Endpoints (v1)
│   │   ├── index.js           # API router aggregator
│   │   ├── authRoutes.js
│   │   ├── clubRoutes.js
│   │   ├── eventRoutes.js
│   │   └── adminRoutes.js
│   ├── controllers/           # Request/Response handlers
│   │   ├── authController.js
│   │   ├── clubController.js
│   │   ├── eventController.js
│   │   └── adminController.js
│   ├── services/              # Business Logic & External Integrations
│   │   ├── qrService.js       # QR Code generation & verification logic
│   │   ├── authService.js     # Login, tokens, password logic
│   │   ├── emailService.js    # SendGrid/Nodemailer integrations
│   │   └── analyticsService.js# Aggregates data for the Admin Portal
│   ├── middlewares/           # RBAC and Validation
│   │   ├── authMiddleware.js  # JWT validation
│   │   ├── rbacMiddleware.js  # Role-checking (e.g., must be CLUB_ADMIN)
│   │   └── errorHandler.js    # Centralized error response formatting
│   └── utils/                 # Helpers (Constants, Regex, Formatters)
│       └── responseHelper.js
├── package.json
└── .env
```

## 3. Technology & Integration Details

- **Backend Framework**: Node.js with Express.
- **ORM/Query Builder**: Sequelize is recommended for rapid development of complex relational queries like fetching "Club Stats" or "User Dashboard".
- **Authentication**: JWT containing `user_id`, `global_role`, and an array of `club_admin_ids` to instantly verify permissions via middleware without hitting the DB on every request.
- **Frontend State Management**: Redux Toolkit (RTK) with RTK Query. It provides robust caching, which is critical for real-time trackers (e.g., Live Events) and the Admin Analytics dashboard.

## 4. Addressing Core Features

- **Real-time Event Tracker**: The frontend dashboard polls (or uses websockets/SSE) a dedicated `/api/v1/events/tracker` endpoint that filters events by the user's registrations and segregates them into Live/Upcoming categories.
- **QR-Based Attendance**: Upon registration, `qrService` hashes the `registration_id` + a fast-rotating secret. The frontend displays this QR. Club Admins have a scanner view that sends the hash to a `/check-in` internal API, securely flipping the `check_in_status`.
- **Publicity Engine & Analytics**: Managed by `bento-grid` layouts dynamically fetching data. Exporting functionality relies on a backend service compiling CSVs via `json2csv` libraries on-the-fly when requested by Club Leads.
