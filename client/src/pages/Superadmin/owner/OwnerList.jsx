import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { SUPER_ADMIN_ROUTE } from "../../../Constant/RoutesConstant";
import { FaEye, FaEdit, FaTrash, FaUndo, FaEyeSlash } from "react-icons/fa";
import { deleteOwner, getOwners, recoverOwner, toggleOwnerVisibility } from "../../../services/ownerService";

function OwnerList() {
  const navigate = useNavigate();

  const [owners, setOwners] = useState([]);

  const fetchOwners = async () => {
    try {
      const res = await getOwners();
      console.log("OWNER API RESPONSE:", res.data);

      setOwners(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover this restaurant!",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      await deleteOwner(id);

      setOwners((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, is_deleted: true } : r
        )
      );

      Swal.fire(
        "Deleted!",
        "Restaurant has been deleted.",
        "success"
      );
    }
  };

  const handleRecover = async (id) => {
    const result = await Swal.fire({
      title: "Recover Restaurant?",
      text: "This restaurant will become available again.",
      showCancelButton: true,
      confirmButtonColor: "rgb(32, 116, 51)",
      confirmButtonText: "Recover",
    });

    if (result.isConfirmed) {
      await recoverOwner(id);

      setOwners((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, is_deleted: false } : r
        )
      );

      Swal.fire(
        "Recovered!",
        "Restaurant recovered successfully.",
        "success"
      );
    }
  };

  const handleToggleVisibility = async (id) => {
    try {
      const res = await toggleOwnerVisibility(id);

      setOwners((prev) =>
        prev.map((r) =>
          r._id === id
            ? { ...r, status: res.data.status }
            : r
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container-fluid py-3 py-md-4">

      {/* HEADER */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">
            Owner List
          </h3>

          <p className="text-muted mb-0">
            Manage restaurant owners
          </p>
        </div>

        <button
          className="btn btn-sm btn-primary d-flex align-items-center justify-content-center"
          onClick={() =>
            navigate(SUPER_ADMIN_ROUTE.OWNERADD)
          }
        >
          + Add Owner
        </button>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">

              <thead className="table-dark">
                <tr>
                  <th className="px-3 py-3 text-nowrap">
                    Name
                  </th>

                  <th className="py-3 text-nowrap">
                    Email
                  </th>
                  <th className="py-3 text-nowrap">
                    Phone
                  </th>

                  <th className="py-3 text-nowrap">
                    Restaurant Name
                  </th>

                  <th className="py-3 text-center text-nowrap">
                    Status
                  </th>

                  <th className="py-3 text-center text-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {!Array.isArray(owners) || owners.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No Owners Found
                    </td>
                  </tr>
                ) : (
                  owners.map((owner) => (
                    <tr
                      key={owner._id}
                      className={
                        owner.is_deleted
                          ? "table-danger"
                          : ""}
                      style={{
                        opacity: owner.is_deleted
                          ? 0.6
                          : 1
                      }} >
                      <td className="px-3 text-nowrap">{owner.name}</td>
                      <td className="text-nowrap">{owner.email}</td>
                      <td className="text-nowrap">{owner.phone}</td>
                      <td className="text-nowrap">
                        {owner.restaurant_id?.restaurant_name || "N/A"}
                      </td>

                      {/* STATUS */}
                      <td className="text-center">
                        {owner.status === "active" ? (
                          <span className="badge bg-success">Active</span>
                        ) : (
                          <span className="badge bg-danger">Inactive</span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="text-center text-nowrap">

                        {/* EDIT */}
                        <div className="d-flex justify-content-center align-items-center gap-1">

                          {/* EDIT */}
                          <button
                            type="button"
                            className="btn btn-sm text-primary border-0 bg-transparent"
                            onClick={() =>
                              navigate(
                                `${SUPER_ADMIN_ROUTE.OWNEREDIT}/${owner._id}`
                              )
                            }
                            disabled={owner.is_deleted}
                            title="Edit"
                          >
                            <FaEdit />
                          </button>


                          {/* DELETE / RECOVER */}
                          {owner.is_deleted ? (

                            <button
                              type="button"
                              className="btn btn-sm text-success border-0 bg-transparent"
                              onClick={() =>
                                handleRecover(owner._id)
                              }
                              title="Recover"
                            >
                              <FaUndo />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-sm text-danger border-0 bg-transparent"
                              onClick={() =>
                                handleDelete(owner._id)
                              }
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          )}

                          {/* VISIBILITY */}
                          <button
                            type="button"
                            className="btn btn-sm text-warning border-0 bg-transparent"
                            onClick={() =>
                              handleToggleVisibility(
                                owner._id
                              )
                            }
                            disabled={owner.is_deleted}
                            title={
                              owner.status === "active"
                                ? "Deactivate"
                                : "Activate"
                            }
                          >

                            {owner.status === "active" ? (
                              <FaEyeSlash />
                            ) : (
                              <FaEye />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerList;