# Freelance Marketplace Platform

A full-stack freelance marketplace where clients post projects, freelancers
bid on them, and accepted bids turn into contracts — built with **Django
REST (function-based views) + SQLite** on the backend and
**HTML/CSS/JavaScript (Fetch API)** on the frontend.

## Folder Structure

```
FreelanceMarketplace/
├── Backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── db.sqlite3            (created after migrate)
│   ├── core/                 Django project (settings, root urls)
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── api/                  Django app — the three required files:
│       ├── db.py             ← database schema (models) for all 5 modules
│       ├── views.py          ← function-based views / 20 CRUD APIs + bonus
│       ├── urls.py           ← API routing
│       ├── models.py         (re-exports db.py so Django migrations work)
│       └── admin.py
│
└── Frontend/
    ├── index.html
    ├── login.html
    ├── register.html
    ├── dashboard.html
    ├── projects.html
    ├── bids.html
    ├── contracts.html
    ├── style.css
    └── script.js
```

## How to Run

### 1. Backend (Django REST API)

```bash
cd Backend
pip install -r requirements.txt
python manage.py makemigrations api
python manage.py migrate
python manage.py runserver
```

The API will be live at **http://127.0.0.1:8000/**.
(Optional) create an admin user to browse data at `/admin/`:
```bash
python manage.py createsuperuser
```

### 2. Frontend

Just open `Frontend/index.html` directly in your browser (double-click it, or
use VS Code's "Live Server" extension). It talks to the backend via
`fetch()` calls to `http://127.0.0.1:8000`, so **keep the Django server
running** while you use the site.

> CORS is fully open (`CORS_ALLOW_ALL_ORIGINS = True`) in `core/settings.py`
> specifically so the frontend can be opened from a different origin
> (file:// or a different port) during development/grading.

## Login / Session Model

There's no separate auth table in the schema, so **login is a lightweight,
practical simulation**: registering creates a Freelancer or Client record;
logging in looks up that email in the corresponding table and stores the
matched profile in `localStorage` as the active session. This is enough to
drive role-based dashboards and to auto-attach `freelancer_name` /
`client_name` on bids and projects, without inventing an extra module
outside the given schema.

## API Reference (20 required + bonus)

| Module | Method | Endpoint |
|---|---|---|
| Freelancer | POST | `/freelancers/add/` |
| Freelancer | GET | `/freelancers/` |
| Freelancer | PUT | `/freelancers/update/<id>/` |
| Freelancer | DELETE | `/freelancers/delete/<id>/` |
| Client | POST | `/clients/add/` |
| Client | GET | `/clients/` |
| Client | PUT | `/clients/update/<id>/` |
| Client | DELETE | `/clients/delete/<id>/` |
| Project | POST | `/projects/add/` |
| Project | GET | `/projects/` (supports `?search=&category=&status=`) |
| Project | PUT | `/projects/update/<id>/` |
| Project | DELETE | `/projects/delete/<id>/` |
| Bid | POST | `/bids/add/` |
| Bid | GET | `/bids/` (supports `?project_title=&freelancer_name=&status=`) |
| Bid | PUT | `/bids/update/<id>/` (also used to Accept/Reject) |
| Bid | DELETE | `/bids/delete/<id>/` |
| Contract | POST | `/contracts/add/` |
| Contract | GET | `/contracts/` (supports `?freelancer_name=&client_name=`) |
| Contract | PUT | `/contracts/update/<id>/` |
| Contract | DELETE | `/contracts/delete/<id>/` |
| **Bonus** | GET | `/freelancers/search/?skill=Django` |
| **Bonus** | GET | `/dashboard/stats/` |

All responses follow `{"success": true/false, "data": ...}`.

## Bonus Features Implemented

- ✅ Project Search & Filter (title, category, status)
- ✅ Freelancer Skill Search
- ✅ Dashboard Statistics (projects, bids, contracts)
- ✅ Project Status Tracking (Open → In Progress → Completed, auto-updates
  when a bid is accepted)
- ✅ Profile Image Upload field on the Freelancer model (`profile_image`,
  accepts `multipart/form-data` on `/freelancers/add/`)

## Core User Flow (matches Sample Testing Data in the brief)

1. A client registers → posts an "E-Commerce Website" project.
2. A freelancer registers → browses `/projects.html` → submits a bid.
3. The client opens `/bids.html`, sees the pending bid, clicks **Accept**.
4. Accepting a bid automatically:
   - creates a **Contract** (`/contracts/add/`)
   - flips the project's status to **In Progress**
5. Both dashboards (`/dashboard.html`) reflect the new contract, and it can
   be marked **Completed** or **Cancelled** from `/contracts.html`.

## Postman Testing

Import the endpoints above into Postman (or use the `curl` examples in this
README) to generate the required API testing screenshots — every endpoint
was manually verified with `curl` during development (create, list, update,
filter/search, and delete all confirmed working end-to-end).

## Notes for Submission

- Take a screenshot of `db.sqlite3` contents via `python manage.py shell` or
  the Django admin (`/admin/`) for the "Database Screenshot" requirement.
- Take Postman screenshots for each of the 20+ endpoints.
- Take frontend screenshots of each page (Home, Register, Login, Projects,
  Bids, Contracts, Dashboard).
