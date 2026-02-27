from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .models import EmployeeCreate, Employee, AttendanceCreate, Attendance
from .db import (
    connect_to_mongo,
    close_mongo_connection,
    create_employee,
    list_employees,
    delete_employee,
    create_attendance,
    list_attendance_for_employee,
)

app = FastAPI(title="HRMS Lite API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.on_event("startup")
async def on_startup():
    await connect_to_mongo()


@app.on_event("shutdown")
async def on_shutdown():
    await close_mongo_connection()


@app.post("/employees", response_model=Employee, status_code=201)
async def api_create_employee(payload: EmployeeCreate):
    try:
        return await create_employee(payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/employees", response_model=list[Employee])
async def api_list_employees():
    return await list_employees()


@app.delete("/employees/{employee_id}", status_code=204)
async def api_delete_employee(employee_id: str):
    deleted = await delete_employee(employee_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Employee not found")


@app.post("/attendance", response_model=Attendance, status_code=201)
async def api_create_attendance(payload: AttendanceCreate):
    try:
        return await create_attendance(payload)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/employees/{employee_id}/attendance", response_model=list[Attendance])
async def api_list_attendance_for_employee(employee_id: str):
    return await list_attendance_for_employee(employee_id)


