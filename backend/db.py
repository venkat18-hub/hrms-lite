import os
from datetime import datetime
from typing import List, Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import ReturnDocument

from .models import EmployeeCreate, Employee, AttendanceCreate, Attendance

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "hrms_lite")

client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None


async def connect_to_mongo():
    global client, db
    if client is None:
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[MONGO_DB_NAME]


async def close_mongo_connection():
    global client
    if client:
        client.close()
        client = None


async def create_employee(payload: EmployeeCreate) -> Employee:
    assert db is not None
    existing = await db.employees.find_one(
        {"$or": [{"employee_id": payload.employee_id}, {"email": payload.email}]}
    )
    if existing:
        raise ValueError("Employee with same ID or email already exists.")

    doc = payload.dict()
    doc["created_at"] = datetime.utcnow()
    result = await db.employees.insert_one(doc)
    stored = await db.employees.find_one({"_id": result.inserted_id})
    return Employee(
        id=str(stored["_id"]),
        employee_id=stored["employee_id"],
        full_name=stored["full_name"],
        email=stored["email"],
        department=stored["department"],
        created_at=stored["created_at"],
    )


async def list_employees() -> List[Employee]:
    assert db is not None
    employees: List[Employee] = []
    cursor = db.employees.find().sort("created_at", 1)
    async for doc in cursor:
        employees.append(
            Employee(
                id=str(doc["_id"]),
                employee_id=doc["employee_id"],
                full_name=doc["full_name"],
                email=doc["email"],
                department=doc["department"],
                created_at=doc["created_at"],
            )
        )
    return employees


async def delete_employee(employee_id: str) -> bool:
    assert db is not None
    result = await db.employees.delete_one({"employee_id": employee_id})
    # also delete associated attendance records
    await db.attendance.delete_many({"employee_id": employee_id})
    return result.deleted_count > 0


async def create_attendance(payload: AttendanceCreate) -> Attendance:
    assert db is not None
    # ensure employee exists
    employee = await db.employees.find_one({"employee_id": payload.employee_id})
    if not employee:
        raise LookupError("Employee not found.")

    doc = payload.dict()
    doc["created_at"] = datetime.utcnow()
    result = await db.attendance.insert_one(doc)
    stored = await db.attendance.find_one({"_id": result.inserted_id})
    return Attendance(
        id=str(stored["_id"]),
        employee_id=stored["employee_id"],
        date=stored["date"],
        status=stored["status"],
        created_at=stored["created_at"],
    )


async def list_attendance_for_employee(employee_id: str) -> List[Attendance]:
    assert db is not None
    records: List[Attendance] = []
    cursor = db.attendance.find({"employee_id": employee_id}).sort("date", 1)
    async for doc in cursor:
        records.append(
            Attendance(
                id=str(doc["_id"]),
                employee_id=doc["employee_id"],
                date=doc["date"],
                status=doc["status"],
                created_at=doc["created_at"],
            )
        )
    return records

