from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class EmployeeBase(BaseModel):
    employee_id: str = Field(..., min_length=1)
    full_name: str = Field(..., min_length=1)
    email: EmailStr
    department: str = Field(..., min_length=1)


class EmployeeCreate(EmployeeBase):
    pass


class Employee(EmployeeBase):
    id: str
    created_at: datetime

    class Config:
        orm_mode = True


class AttendanceBase(BaseModel):
    employee_id: str
    date: date
    status: str = Field(..., pattern="^(Present|Absent)$")


class AttendanceCreate(AttendanceBase):
    pass


class Attendance(AttendanceBase):
    id: str
    created_at: datetime

    class Config:
        orm_mode = True

