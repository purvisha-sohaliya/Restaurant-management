import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { SUPER_ADMIN_ROUTE } from "../../../Constant/RoutesConstant";
import { FaEdit, FaTrash, FaEye, FaEyeSlash, FaUndo, } from "react-icons/fa";
import { getRestaurants, deleteRestaurant, toggleVisibility, recoverRestaurant, } from "../../../services/restaurantService";

function RestaurantsList() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const fetchData = async () => {
    try {
      const res = await getRestaurants();
      setRestaurants(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchData();
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
      await deleteRestaurant(id);

      setRestaurants((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, isDeleted: true } : r
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
      await recoverRestaurant(id);

      setRestaurants((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, isDeleted: false } : r
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
      const res = await toggleVisibility(id);

      setRestaurants((prev) =>
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
          <h3 className="fw-bold mb-1">Restaurant List</h3>
          <p className="text-muted mb-0 small">
            Manage all restaurants
          </p>
        </div>

        <button
          className="btn btn-sm btn-primary d-flex align-items-center justify-content-center"
          onClick={() => navigate(SUPER_ADMIN_ROUTE.RESTAURANTSADD)}>
          <span>+</span>
          Add Restaurant
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
                    Address
                  </th>

                  <th className="py-3 text-nowrap">
                    City
                  </th>

                  <th className="py-3 text-nowrap">
                    Country
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
                {restaurants.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      No Restaurants Found
                    </td>
                  </tr>
                ) : (
                  restaurants.map((restaurant) => (
                    <tr
                      key={restaurant._id}
                      className={restaurant.isDeleted ? "table-danger" : ""}
                      style={{
                        opacity: restaurant.isDeleted ? 0.6 : 1
                      }}
                    >

                      {/* NAME */}
                      <td className="px-3 text-nowrap">
                        <span className="fw-semibold">
                          {restaurant.restaurant_name}
                        </span>
                      </td>
                      <td className="text-nowrap">{restaurant.email}</td>
                      <td className="text-nowrap">{restaurant.phone}</td>
                      <td style={{ minWidth: "180px", maxWidth: "250px" }}>
                        <span
                          className="d-block text-truncate"
                          title={restaurant.address}
                        >
                          {restaurant.address || "—"}
                        </span>
                      </td>
                      <td className="text-nowrap">{restaurant.city}</td>
                      <td className="text-nowrap">{restaurant.country}</td>
                      {/* STATUS */}
                      <td className="text-center">
                        {restaurant.status === "active" ? (
                          <span className="badge bg-success">Active</span>
                        ) : (
                          <span className="badge bg-danger">Inactive</span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="text-center text-nowrap">

                        {/* EDIT */}
                        <button
                          className="btn btn-sm text-primary border-0 bg-transparent"
                          onClick={() =>
                            navigate(`${SUPER_ADMIN_ROUTE.RESTAURANTSEDIT}/${restaurant._id}`)
                          }
                          disabled={restaurant.isDeleted}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>

                        {/* DELETE / RECOVER */}
                        {restaurant.isDeleted ? (
                          <button

                            className="btn btn-sm text-success border-0 bg-transparent"
                            onClick={() => handleRecover(restaurant._id)}
                          >
                            <FaUndo />
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm text-danger border-0 bg-transparent"
                            onClick={() => handleDelete(restaurant._id)}
                          >
                            <FaTrash />
                          </button>
                        )}

                        {/* VISIBILITY */}
                        <button
                          className="btn btn-sm text-warning border-0 bg-transparent"
                          onClick={() => handleToggleVisibility(restaurant._id)}
                          disabled={restaurant.isDeleted}
                        >
                          {restaurant.status === "active" ? (
                            <FaEyeSlash />
                          ) : (
                            <FaEye />
                          )}
                        </button>
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

export default RestaurantsList;