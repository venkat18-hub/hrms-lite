import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

type Employee = {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
};

type Attendance = {
  id: string;
  employee_id: string;
  date: string;
  status: "Present" | "Absent";
};

type LoadingState = "idle" | "loading" | "success" | "error";

export const App: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );
  const [attendance, setAttendance] = useState<Attendance[]>([]);

  const [empForm, setEmpForm] = useState({
    employee_id: "",
    full_name: "",
    email: "",
    department: "",
  });
  const [attendanceForm, setAttendanceForm] = useState({
    date: "",
    status: "Present" as "Present" | "Absent",
  });

  const [empLoading, setEmpLoading] = useState<LoadingState>("idle");
  const [attendanceLoading, setAttendanceLoading] =
    useState<LoadingState>("idle");
  const [globalError, setGlobalError] = useState<string | null>(null);

  const selectedEmployee = useMemo(
    () =>
      employees.find((e) => e.employee_id === selectedEmployeeId) ?? null,
    [employees, selectedEmployeeId]
  );

  const fetchEmployees = async () => {
    setEmpLoading("loading");
    setGlobalError(null);
    try {
      const res = await axios.get<Employee[]>(`${API_BASE}/employees`);
      setEmployees(res.data);
      setEmpLoading("success");
    } catch (err: any) {
      console.error(err);
      setEmpLoading("error");
      setGlobalError(
        err.response?.data?.detail || "Failed to load employees."
      );
    }
  };

  const fetchAttendance = async (employee_id: string) => {
    setAttendanceLoading("loading");
    setGlobalError(null);
    try {
      const res = await axios.get<Attendance[]>(
        `${API_BASE}/employees/${employee_id}/attendance`
      );
      setAttendance(res.data);
      setAttendanceLoading("success");
    } catch (err: any) {
      console.error(err);
      setAttendanceLoading("error");
      setGlobalError(
        err.response?.data?.detail || "Failed to load attendance records."
      );
    }
  };

  useEffect(() => {
    void fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      void fetchAttendance(selectedEmployeeId);
    } else {
      setAttendance([]);
    }
  }, [selectedEmployeeId]);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmpLoading("loading");
    setGlobalError(null);
    try {
      await axios.post(`${API_BASE}/employees`, empForm);
      setEmpForm({
        employee_id: "",
        full_name: "",
        email: "",
        department: "",
      });
      await fetchEmployees();
      setEmpLoading("success");
    } catch (err: any) {
      console.error(err);
      setEmpLoading("error");
      setGlobalError(err.response?.data?.detail || "Failed to add employee.");
    }
  };

  const handleDeleteEmployee = async (employee_id: string) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }
    setEmpLoading("loading");
    setGlobalError(null);
    try {
      await axios.delete(`${API_BASE}/employees/${employee_id}`);
      if (selectedEmployeeId === employee_id) {
        setSelectedEmployeeId(null);
      }
      await fetchEmployees();
      setEmpLoading("success");
    } catch (err: any) {
      console.error(err);
      setEmpLoading("error");
      setGlobalError(
        err.response?.data?.detail || "Failed to delete employee."
      );
    }
  };

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;
    setAttendanceLoading("loading");
    setGlobalError(null);
    try {
      await axios.post(`${API_BASE}/attendance`, {
        employee_id: selectedEmployeeId,
        date: attendanceForm.date,
        status: attendanceForm.status,
      });
      await fetchAttendance(selectedEmployeeId);
      setAttendanceForm((prev) => ({ ...prev, date: "" }));
      setAttendanceLoading("success");
    } catch (err: any) {
      console.error(err);
      setAttendanceLoading("error");
      setGlobalError(
        err.response?.data?.detail || "Failed to mark attendance."
      );
    }
  };

  const totalPresent = useMemo(() => {
    if (!attendance.length) return 0;
    return attendance.filter((r) => r.status === "Present").length;
  }, [attendance]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>HRMS Lite</h1>
          <p className="subtitle">
            Lightweight HR tool for employee &amp; attendance management
          </p>
        </div>
      </header>

      <main className="layout">
        <section className="panel">
          <div className="panel-header">
            <h2>Employees</h2>
            <span className="badge">{employees.length}</span>
          </div>

          <form className="card form-card" onSubmit={handleCreateEmployee}>
            <h3>Add Employee</h3>
            <div className="form-grid">
              <label>
                <span>Employee ID</span>
                <input
                  type="text"
                  required
                  value={empForm.employee_id}
                  onChange={(e) =>
                    setEmpForm((prev) => ({
                      ...prev,
                      employee_id: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>Full Name</span>
                <input
                  type="text"
                  required
                  value={empForm.full_name}
                  onChange={(e) =>
                    setEmpForm((prev) => ({
                      ...prev,
                      full_name: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  required
                  value={empForm.email}
                  onChange={(e) =>
                    setEmpForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>Department</span>
                <input
                  type="text"
                  required
                  value={empForm.department}
                  onChange={(e) =>
                    setEmpForm((prev) => ({
                      ...prev,
                      department: e.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <button
              type="submit"
              className="button primary"
              disabled={empLoading === "loading"}
            >
              {empLoading === "loading" ? "Saving..." : "Add Employee"}
            </button>
          </form>

          <div className="card list-card">
            {empLoading === "loading" && !employees.length ? (
              <p className="muted">Loading employees…</p>
            ) : !employees.length ? (
              <p className="muted">No employees yet. Add your first employee.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr
                      key={emp.id}
                      className={
                        emp.employee_id === selectedEmployeeId ? "row-active" : ""
                      }
                      onClick={() =>
                        setSelectedEmployeeId(emp.employee_id === selectedEmployeeId
                          ? null
                          : emp.employee_id)
                      }
                    >
                      <td>{emp.employee_id}</td>
                      <td>{emp.full_name}</td>
                      <td>{emp.email}</td>
                      <td>{emp.department}</td>
                      <td>
                        <button
                          type="button"
                          className="button ghost danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDeleteEmployee(emp.employee_id);
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Attendance</h2>
            {selectedEmployee ? (
              <span className="pill">
                For {selectedEmployee.full_name} ({selectedEmployee.employee_id})
              </span>
            ) : (
              <span className="pill muted">Select an employee</span>
            )}
          </div>

          <form
            className="card form-card"
            onSubmit={handleMarkAttendance}
          >
            <h3>Mark Attendance</h3>
            {!selectedEmployee && (
              <p className="muted">Choose an employee from the left panel.</p>
            )}
            <div className="form-grid">
              <label>
                <span>Date</span>
                <input
                  type="date"
                  required
                  disabled={!selectedEmployee}
                  value={attendanceForm.date}
                  onChange={(e) =>
                    setAttendanceForm((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>Status</span>
                <select
                  disabled={!selectedEmployee}
                  value={attendanceForm.status}
                  onChange={(e) =>
                    setAttendanceForm((prev) => ({
                      ...prev,
                      status: e.target.value as "Present" | "Absent",
                    }))
                  }
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
              </label>
            </div>
            <button
              type="submit"
              className="button primary"
              disabled={!selectedEmployee || attendanceLoading === "loading"}
            >
              {attendanceLoading === "loading"
                ? "Saving..."
                : "Save Attendance"}
            </button>
          </form>

          <div className="card list-card">
            <div className="panel-subheader">
              <h3>Attendance Records</h3>
              {selectedEmployee && (
                <span className="badge secondary">
                  Total Present: {totalPresent}
                </span>
              )}
            </div>
            {!selectedEmployee ? (
              <p className="muted">
                Select an employee to view their attendance history.
              </p>
            ) : attendanceLoading === "loading" && !attendance.length ? (
              <p className="muted">Loading attendance…</p>
            ) : !attendance.length ? (
              <p className="muted">No attendance records yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((r) => (
                    <tr key={r.id}>
                      <td>{new Date(r.date).toLocaleDateString()}</td>
                      <td>
                        <span
                          className={
                            r.status === "Present"
                              ? "status-pill present"
                              : "status-pill absent"
                          }
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      {globalError && (
        <div className="toast error">
          <span>{globalError}</span>
          <button
            type="button"
            className="button ghost"
            onClick={() => setGlobalError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      <footer className="app-footer">
        <span>HRMS Lite &middot; Demo internal HR tool</span>
      </footer>
    </div>
  );
};

