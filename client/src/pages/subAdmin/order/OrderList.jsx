import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaSearch, } from "react-icons/fa";
import { getOrders, } from "../../../services/orderService";
import { SUB_ADMIN_ROUTE } from "../../../Constant/RoutesConstant";

function OrderList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [tableFilter, setTableFilter] = useState("All");
  const filteredOrders = orders.filter((order) => {
  const searchText = search.toLowerCase().trim();

    // SEARCH FILTER
    const matchesSearch =
      (order.order_number || "")
        .toLowerCase()
        .includes(searchText) ||
      (order.customer_name || "")
        .toLowerCase()
        .includes(searchText) ||
      String(order.table_id?.tableNumber || "")
        .toLowerCase()
        .includes(searchText) ||
      (order.waiter_id?.name || "")
        .toLowerCase()
        .includes(searchText);

    // STATUS FILTER
    const matchesStatus =
      statusFilter === "All" ||
      order.order_status === statusFilter;

    // TABLE FILTER
    const matchesTable =
      tableFilter === "All" ||
      String(order.table_id?._id) === String(tableFilter);

    return (
      matchesSearch &&matchesStatus && matchesTable);
  });
  useEffect(() => {
    fetchOrders();
  }, []);

  const uniqueTables = [
    ...new Map(
      orders
        .filter((order) => order.table_id)
        .map((order) => [
          order.table_id._id,
          order.table_id,
        ])
    ).values(),
  ];
  const fetchOrders = async () => {
    try {
      const res = await getOrders();

      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Order Management</h3>
          <small className="text-muted">
            Manage Restaurant Orders
          </small>
        </div>

        <button
          className="btn btn-success"
          onClick={() => navigate(SUB_ADMIN_ROUTE.ORDER_ADD)}
        >
          <FaPlus className="me-2" />
          Add Order
        </button>
      </div>

      {/* Search & Filter */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search Order..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

              </div>
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Preparing">Preparing</option>
                <option value="Ready">Ready</option>
                <option value="Served">Served</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={tableFilter}
                onChange={(e) => setTableFilter(e.target.value)}>
                <option value="All">All Tables</option>
                {uniqueTables.map((table) => (
                  <option key={table._id} value={table._id}>
                    Table {table.tableNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* Order Table */}
       <div className="card border-0 shadow-sm rounded-3 overflow-hidden">

        {/* HEADER */}
        <div className="card-header bg-white border-0 px-3 px-md-4 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="fw-bold mb-1">Order List</h5>
              <small className="text-muted">
                View and track all restaurant orders
              </small>
            </div>

            <span className="badge bg-light text-dark rounded-pill px-3 py-2">
              {filteredOrders.length} Orders
            </span>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">

            <thead className="table-light">
              <tr>
                <th className="py-3 px-4">Order Details</th>
                <th className="py-3">Table</th>
                <th className="py-3">Customer</th>
                <th className="py-3">Total</th>
                <th className="py-3">Status</th>
                <th className="py-3">Date</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div
                      className="spinner-border spinner-border-sm text-success me-2"
                      role="status"
                    />
                    <span className="text-muted">
                      Loading orders...
                    </span>
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => (
                  <tr key={order._id}>

                    {/* ORDER ID */}
                    <td>
                      <div className="d-flex align-items-center gap-3 px-3">

                        <div>
                          <div className="fw-bold">
                            {order.order_number ||
                              order._id.slice(-6)}
                          </div>
                          <small className="text-muted">
                            Restaurant Order
                          </small>
                        </div>
                      </div>
                    </td>

                    {/* TABLE */}
                    <td>
                      <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
                        T{order.table_id?.tableNumber || "-"}
                      </span>
                    </td>

                    {/* CUSTOMER */}
                    <td>
                      <span className="fw-medium">
                        {order.customer_name || "Walk In"}
                      </span>
                    </td>

                    {/* TOTAL */}
                    <td>
                      <span className="fw-bold">
                        ₹{Number(
                          order.total_amount || order.total || 0
                        ).toLocaleString("en-IN")}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td>
                      <span
                        className={`badge rounded-pill px-3 py-2 ${order.order_status === "Pending"
                            ? "bg-warning text-white"
                            : order.order_status === "Preparing"
                              ? "bg-primary  text-white"
                              : order.order_status === "Ready"
                                ? "bg-info text-white"
                                : order.order_status === "Served"
                                  ? "bg-secondary text-white"
                                  : order.order_status === "Completed"
                                    ? "bg-success text-white"
                                    : "bg-danger text-white"
                          }`}>
                        {order.order_status || "Unknown"}
                      </span>
                    </td>

                    {/* DATE */}
                    <td>
                      <span className="text-muted">
                        {new Date(
                          order.createdAt
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <h6 className="fw-bold mb-1">
                      No Orders Found
                    </h6>
                    <p className="text-muted mb-0">
                      Restaurant orders will appear here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        {!loading && filteredOrders.length > 0 && (
          <div className="card-footer bg-white border-0 px-3 px-md-4 py-3">
            <small className="text-muted">
              Showing {filteredOrders.length} order
              {filteredOrders.length !== 1 ? "s" : ""}
            </small>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderList;