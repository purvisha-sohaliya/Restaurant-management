import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaUndo, FaEyeSlash, FaEye, FaPlus, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { deleteCategory, getCategories, restoreCategory, toggleCategoryVisibility, } from "../../../services/categoryService";
import { SUB_ADMIN_ROUTE } from "../../../Constant/RoutesConstant";

function CategoryList() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showAllCategories, setShowAllCategories] = useState(false);


  // Fetch
  const fetchData = async () => {
    try {
      const res = await getCategories();
      setCategories(res?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCategories = categories.filter((category) => {
    if (filter === "all") return true;
    if (filter === "active") return category.status === "active";
    if (filter === "inactive") return category.status === "inactive";
    return true;
  });

  //Multiple Select
  const handleSelect = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  //Delete
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover this category!",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      await deleteCategory(id);

      setCategories((prev) =>
        prev.map((c) =>
          c._id === id ? { ...c, isDeleted: true } : c
        )
      );

      Swal.fire(
        "Deleted!",
        "Category deleted successfully",
        "success"
      );
    }
  };

  //Restore
  const handleRecover = async (id) => {
    const result = await Swal.fire({
      title: "Recover Category?",
      showCancelButton: true,
      confirmButtonColor: "green",
      confirmButtonText: "Recover",
    });

    if (result.isConfirmed) {
      await restoreCategory(id);

      setCategories((prev) =>
        prev.map((c) =>
          c._id === id ? { ...c, isDeleted: false } : c
        )
      );

      Swal.fire(
        "Recovered!",
        "Category restored",
        "success"
      );
    }
  };

  //Toggle Status
  const handleToggleVisibility = async (id) => {
    try {
      const category = categories.find((c) => c._id === id);
      const newStatus =
        category.status === "active" ? "inactive" : "active";
      const res = await toggleCategoryVisibility(id, newStatus);
      setCategories((prev) =>
        prev.map((c) =>
          c._id === id
            ? {
              ...c,
              status: res.data.status,
            }
            : c
        )
      );
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="container-fluid py-4">
      {/* HEADER */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <h2 className="fw-bold">Category Management</h2>
            <small className="text-muted">
              Manage restaurant categories efficiently
            </small>
          </div>

          <button type="button" className="btn btn-success"
            onClick={() => navigate(SUB_ADMIN_ROUTE.CATEGORYADD)}>
            <FaPlus className="me-2" />Add Category
          </button>
        </div>

        <div className="d-flex gap-2 mt-3 flex-wrap">
          <button
            className={`btn rounded-pill filter-btn ${filter === "all" ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => setFilter("all")}>
            All ({categories.length})
          </button>

          <button
            className={`btn rounded-pill filter-btn ${filter === "active"
              ? "btn-success"
              : "btn-outline-success"
              }`}
            onClick={() => setFilter("active")}>
            Active (
            {categories.filter((c) => c.status === "active").length})
          </button>

          <button
            className={`btn rounded-pill filter-btn ${filter === "inactive"
              ? "btn-secondary"
              : "btn-outline-secondary"
              }`}
            onClick={() => setFilter("inactive")} >
            Inactive (
            {categories.filter((c) => c.status === "inactive").length})
          </button>
        </div>
      </div>

      {/* Card View */}
      <div className="row g-4">
        {(showAllCategories ? filteredCategories : filteredCategories.slice(0, 12)).map((category) => (
          <div className="col-xl-3 col-lg-4 col-md-6 col-6 mb-2"
            key={category._id} >
            <div className={`card border-0 shadow-sm h-100 overflow-hidden rounded-4 ${category.isDeleted ? "opacity-75" : ""
              }`}
              style={{
                backgroundColor: category.isDeleted ? "#fff5f5" : "#ffffff",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }} >
              {/* Image */}
              <div className="position-relative p-2 pb-0">
                <div className="overflow-hidden position-relative rounded-3 bg-light"
                  style={{ height: "165px", }}  >
                  <img src={category.image || "https://via.placeholder.com/400x220?text=No+Image"}
                    alt={category.category_name}
                    className="w-100 h-100 "
                    style={{ objectFit: "cover" }}
                  />

                  {/* Image overlay */}
                  <div className="position-absolute bottom-0 start-0 w-100"
                    style={{ height: "55px", background: "linear-gradient(transparent, rgba(0,0,0,0.45))", }} />

                  {/* Checkbox */}
                  <div className="position-absolute top-0 start-0 m-3">
                    <input type="checkbox" className="form-check-input shadow-sm"
                      style={{ width: "18px", height: "18px", cursor: "pointer", }}

                      checked={selectedCategories.includes(category._id)}
                      onChange={() => handleSelect(category._id)} />
                  </div>

                  {/* Status */}
                  <span
                    className={`badge position-absolute top-0 end-0 m-3 rounded-pill px-3 py-2 ${category.status === "active"
                      ? "bg-success"
                      : "bg-danger"
                      }`} >
                    <span className="me-1">●</span>
                    {category.status}
                  </span>

                  {/* Deleted label */}
                  {category.isDeleted && (
                    <span className="badge bg-danger position-absolute bottom-0 start-0 m-3 rounded-pill px-3 py-2">
                      Deleted
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="card-body px-3 pt-3 pb-2">
                <h6
                  className="fw-bold text-dark mb-3 text-truncate"
                  title={category.category_name} >
                  {category.category_name}
                </h6>

                <div
                  className="rounded-3 p-3 bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-secondary small">
                      <FaCalendarAlt className="me-2" />
                      Created
                    </span>

                    <span className="fw-semibold small text-dark">
                      {category.createdAt
                        ? new Date(category.createdAt).toLocaleDateString(
                          "en-IN"
                        )
                        : "-"}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary small">
                      <FaEye className="me-2" />
                      Visibility
                    </span>

                    <span
                      className={`badge rounded-pill px-2 py-1 ${category.status === "active"
                        ? "bg-success-subtle text-success"
                        : "bg-danger-subtle text-danger"
                        }`}>
                      {category.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="card-footer bg-white border-0 px-3 pt-2 pb-3 mt-auto">
                <div className="d-flex align-items-center justify-content-between gap-2">
                  {/* Edit */}
                  <button type="button"
                    className="btn rounded-3 flex-fill py-2 bg-light text-primary"
                    title="Edit Category"
                    onClick={() =>
                      navigate(`${SUB_ADMIN_ROUTE.CATEGORYEDIT}/${category._id}`)}>
                    <FaEdit />
                  </button>

                  {/* Recover / Delete */}
                  {category.isDeleted ? (
                    <button
                      type="button"
                      className="btn rounded-3 flex-fill py-2 bg-light text-success"
                      title="Recover Category"
                      onClick={() => handleRecover(category._id)} >
                      <FaUndo />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn rounded-3 flex-fill py-2 bg-light text-danger"
                      title="Delete Category"
                      onClick={() => handleDelete(category._id)}>
                      <FaTrash />
                    </button>
                  )}

                  {/* Visibility */}
                  <button
                    type="button"
                    className="btn rounded-3 flex-fill py-2"
                    style={{
                      background:
                        category.status === "active"
                          ? "#fff5df"
                          : "#e8f8ef",
                      color:
                        category.status === "active"
                          ? "#b77900"
                          : "#198754",
                    }}
                    title={
                      category.status === "active"
                        ? "Deactivate Category"
                        : "Activate Category"
                    }
                    onClick={() => handleToggleVisibility(category._id)}
                  >
                    {category.status === "active" ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SEE MORE / SEE LESS BUTTON */}
      {filteredCategories.length > 12 && (
        <div className="text-center mt-4 mb-4">
          <button
            type="button"
            className="btn btn-outline-primary rounded-pill px-4 py-2"
            onClick={() =>
              setShowAllCategories((prev) => !prev)
            }
          >
            {showAllCategories ? "See Less" : "See More"}
          </button>
        </div>
      )}
    </div>
  );
}

export default CategoryList;