# HRMS Lite

A lightweight Human Resource Management System (HRMS Lite) with:

- **FastAPI + MongoDB** backend
- **React + Vite** frontend

It lets an admin:

- Manage employees (add, list, delete)
- Track daily attendance (mark Present/Absent per day)
- View per-employee attendance history and total present days

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Axios
- **Backend**: FastAPI, Motor (MongoDB async driver), Uvicorn
- **Database**: MongoDB

## Running the project locally

### Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB running locally or in the cloud (MongoDB URI)

### 1. Backend (FastAPI)

From the `backend` directory:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # on Windows

pip install -r requirements.txt
```

Optionally, create a `.env` file in `backend` with:

```bash
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=hrms_lite
```

Then run the API:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`, with a health check at `/health` and docs at `/docs`.

### 2. Frontend (React)

From the `frontend` directory:

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend` (optional; defaults to localhost):

```bash
VITE_API_BASE=http://localhost:8000
```

Run the dev server:

```bash
npm run dev
```

Open the printed URL in your browser (typically `http://localhost:5173`).

## Deployment Notes

### Backend

- Deploy to a service like Render / Railway / Fly.io.
- Configure environment variables:
  - `MONGO_URI` (cloud MongoDB URI, e.g. MongoDB Atlas)
  - `MONGO_DB_NAME` (e.g. `hrms_lite`)
- Expose the FastAPI app on port 8000 (or the provider’s default).

### Frontend

- Deploy to Vercel / Netlify.
- Build command: `npm run build`
- Output directory: `dist`
- Set environment variable:
  - `VITE_API_BASE` pointing to the deployed backend URL, e.g. `https://your-backend.example.com`

## Assumptions & Limitations

- Single admin user; no authentication implemented.
- Basic validations only:
  - Required fields on backend and frontend
  - Email format validated by FastAPI/Pydantic
  - Duplicate employee detection by ID or email
- No pagination or advanced filtering; intended for a small dataset.

