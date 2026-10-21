import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaEye,
  FaEyeSlash,
  FaUndo,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import {
  getStaff,
  deleteStaff,
  changeStaffStatus,
  restoreStaff,
} from "../../../services/staffService";

import { SUB_ADMIN_ROUTE } from "../../../Constant/RoutesConstant";

function StaffList() {
  const navigate = useNavigate();

  const [staffData, setStaffData] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // FETCH
  const fetchStaff = async () => {
    try {
      const res = await getStaff();
      setStaffData(res?.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchStaff();
    setCurrentPage(1);
  }, [selectedRole, selectedStatus]);
  // FILTER
  const filteredStaff = staffData.filter((s) => {
    const roleMatch = !selectedRole || s.role === selectedRole;
    const statusMatch = !selectedStatus || s.status === selectedStatus;
    return roleMatch && statusMatch;
  });
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentStaff = filteredStaff.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(
    filteredStaff.length / itemsPerPage
  );

  // SELECT ALL
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStaff(staffData.map((s) => s._id));
    } else {
      setSelectedStaff([]);
    }
  };

  const handleSelect = (id) => {
    setSelectedStaff((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  // DELETE (soft delete UI)
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Staff?",
      text: "This action cannot be undone",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes Delete",
    });

    if (result.isConfirmed) {
      await deleteStaff(id);

      setStaffData((prev) =>
        prev.map((s) =>
          s._id === id ? { ...s, is_deleted: true } : s
        )
      );

      Swal.fire("Deleted!", "Staff removed", "success");
    }
  };

  // RESTORE
  const handleRecover = async (id) => {
    const result = await Swal.fire({
      title: "Restore Staff?",
      showCancelButton: true,
      confirmButtonColor: "green",
      confirmButtonText: "Restore",
    });

    if (result.isConfirmed) {
      await restoreStaff(id);

      setStaffData((prev) =>
        prev.map((s) =>
          s._id === id ? { ...s, is_deleted: false } : s
        )
      );

      Swal.fire("Restored!", "Staff restored successfully", "success");
    }
  };

  // STATUS TOGGLE
  const handleToggleStatus = async (id) => {
    try {
      const staff = staffData.find((s) => s._id === id);
      if (!staff) return;

      const newStatus =
        staff.status === "active" ? "blocked" : "active";

      const res = await changeStaffStatus(id, newStatus);

      if (res?.success) {
        setStaffData((prev) =>
          prev.map((s) =>
            s._id === id ? { ...s, status: res.data.status } : s
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
     <div className="container-fluid py-4">

      {/* HEADER */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-2">
        <div>
          <h4 className="fw-bold mb-1">Staff List</h4>
          <p className="text-muted small mb-0">
            Manage and track all restaurant staff
          </p>
        </div>

        <button
          type="button"
          className="btn btn-success rounded-3 px-3 py-2"
          onClick={() => navigate(SUB_ADMIN_ROUTE.STAFFADD)}
        >
          <FaPlus className="me-2" />
          Add Staff
        </button>
      </div>

      {/* FILTERS */}
        <div className="card-body shadow-none px-0">
          <div className="row g-3">
            <div className="col-md-3">
              <select  className="form-select"value={selectedRole}
                onChange={(e) => { setSelectedRole(e.target.value);
                  setCurrentPage(1);}}>
                <option value="">All Roles</option>
                <option value="manager">Manager</option>
                <option value="cashier">Cashier</option>
                <option value="waiter">Waiter</option>
                <option value="kitchen">Kitchen</option>
              </select>
            </div>

            <div className="col-md-3">
              <select className="form-select" value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value);
                  setCurrentPage(1);}} >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
        </div>

      {/* STAFF TABLE */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-3 py-3">
                  <input type="checkbox"
                    className="form-check-input"
                    checked={ currentStaff.length > 0 &&
                      currentStaff.every((staff) => selectedStaff.includes(staff._id)
                      )} onChange={handleSelectAll}
                  />
                </th>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {currentStaff.length > 0 ? (
                currentStaff.map((staff, index) => (
                  <tr key={staff._id}
                    className={staff.is_deleted ? "table-danger opacity-50" : ""}>
                    <td className="px-3">
                      <input  type="checkbox" className="form-check-input"
                        checked={selectedStaff.includes(staff._id)}
                        onChange={() => handleSelect(staff._id)}/>
                    </td>

                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle bg-success bg-opacity-10  text-white fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: "38px", height: "38px" }}>
                          {staff.name?.charAt(0).toUpperCase() || "S"}
                        </div>
                        <span className="fw-semibold">
                          {staff.name}
                        </span>
                      </div>
                    </td>

                    <td>{staff.email}</td>
                    <td>{staff.phone || "-"}</td>

                    <td>
                      <span className="badge bg-light text-dark border text-capitalize rounded-pill px-3 py-2">
                        {staff.role?.replace("_", " ")}
                      </span>
                    </td>

                    <td>
                      <span className={`badge rounded-pill px-3 py-2 ${staff.status === "active"
                          ? "bg-success text-white"
                          : "bg-danger text-white"
                        }`}>
                        {staff.status}
                      </span>
                    </td>

                    <td>
                      <div className="d-flex justify-content-center gap-2">

                        <button type="button"className="btn btn-outline-primary btn-sm"
                          title="Edit" disabled={staff.is_deleted}
                          onClick={() => navigate(`${SUB_ADMIN_ROUTE.STAFFEDIT}/${staff._id}`)}>
                          <FaEdit />
                        </button>

                        {staff.is_deleted ? (
                          <button type="button" className="btn btn-outline-success btn-sm"
                            title="Restore" onClick={() => handleRecover(staff._id)}>
                            <FaUndo />
                          </button>
                        ) : (
                          <button type="button" className="btn btn-outline-danger btn-sm"
                            title="Delete"onClick={() => handleDelete(staff._id)} >
                            <FaTrash />
                          </button>
                        )}

                        <button type="button" className="btn btn-outline-warning btn-sm"
                          title="Change Status" disabled={staff.is_deleted} onClick={() => handleToggleStatus(staff._id)} >
                          {staff.status === "active"
                            ? <FaEyeSlash />
                            : <FaEye />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <h6 className="fw-bold mb-1">No Staff Found</h6>
                    <p className="text-muted mb-0">
                      Try changing the selected filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mt-4">
        <small className="text-muted">
          Showing {filteredStaff.length === 0 ? 0 : indexOfFirstItem + 1} to{" "}
          {Math.min(indexOfLastItem, filteredStaff.length)} of{" "}
          {filteredStaff.length} entries
        </small>

        <nav>
          <ul className="pagination mb-0">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button type="button" className="page-link"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} >
                Previous
              </button>
            </li>

            {[...Array(totalPages)].map((_, index) => (
              <li key={index} className={`page-item ${currentPage === index + 1 ? "active" : ""}`} >
                <button type="button" className="page-link" onClick={() => setCurrentPage(index + 1)} >
                  {index + 1}
                </button>
              </li>
            ))}

            <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? "disabled" : ""
              }`}>
              <button type="button" className="page-link"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}>
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default StaffList;