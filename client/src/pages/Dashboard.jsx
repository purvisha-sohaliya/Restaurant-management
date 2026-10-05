import React, { useEffect, useState } from "react";
import {
  FaMoneyBillWave, FaClipboardList, FaChair, FaUsers, FaClock, FaCheckCircle, FaUtensils,
  FaStore, FaUserTie, FaUserFriends, FaListAlt, FaFileInvoiceDollar,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../Constant/CommonConstant";
import { getDashboard } from "../services/dashboardService";

const Dashboard = () => {
  const { user } = useAuth();
  const CURRENT_ROLE = user?.role;
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({
    revenue: 0,
    totalOrders: 0,
    availableTables: 0,
    occupiedTables: 0,
    reservedTables: 0,
    cleaningTables: 0,
    waitingCustomers: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    completedOrders: 0,
    totalStaff: 0,
    totalRestaurants: 0,
    totalOwners: 0,
    totalMenu: 0,
    totalCategories: 0,
    totalBills: 0,
    pendingBills: 0,
    recentOrders: [],
  });

  useEffect(() => {
    if (CURRENT_ROLE) {
      loadDashboard();
    }
  }, [CURRENT_ROLE]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await getDashboard();
      if (res?.success) {
        setDashboard(res.data);
      }
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="container-fluid min-vh-100 bg-light d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            role="status"
          />

          <p className="text-muted mb-0">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // ================= CARD COMPONENT =================

  const Card = ({ title, value, icon, color }) => (
    <div className="col-12 col-sm-6 col-xl-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body p-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <p className="text-muted small mb-1">
                {title}
              </p>

              <h4 className="fw-bold mb-0">
                {value}
              </h4>
            </div>
            <div className={`dashboard-card-icon ${color}`}>
              {React.cloneElement(icon, {
                size: 18,
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ================= TITLE =================
  const getDashboardTitle = () => {
    switch (CURRENT_ROLE) {
      case ROLES.SUPER_ADMIN:
        return "Super Admin Dashboard";

      case ROLES.OWNER:
        return "Owner Dashboard";

      case ROLES.MANAGER:
        return "Manager Dashboard";

      case ROLES.WAITER:
        return "Waiter Dashboard";

      case ROLES.KITCHEN:
        return "Kitchen Dashboard";

      default:
        return "Dashboard";
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100 p-3 p-md-4">
      {/* ================= HEADER ================= */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1">
          {getDashboardTitle()}
        </h4>

        <p className="text-muted small mb-0">
          Overview of today's restaurant activity
        </p>
      </div>

      {/* ================= SUPER ADMIN =================== */}
      {CURRENT_ROLE === ROLES.SUPER_ADMIN && (
        <div className="row g-3">
          <Card
            title="Total Restaurants"
            value={dashboard.totalRestaurants}
            icon={<FaStore />}
            color="primary"
          />

          <Card
            title="Total Owners"
            value={dashboard.totalOwners}
            icon={<FaUserTie />}
            color="success"
          />

          <Card
            title="Total Orders"
            value={dashboard.totalOrders}
            icon={<FaClipboardList />}
            color="warning"
          />

          <Card
            title="Total Revenue"
            value={`₹${dashboard.revenue.toLocaleString(
              "en-IN"
            )}`}
            icon={<FaMoneyBillWave />}
            color="danger"
          />
        </div>
      )}

      {/* ================= OWNER ========================= */}

      {CURRENT_ROLE === ROLES.OWNER && (
        <>
          <div className="row g-3">
            <Card
              title="Total Orders"
              value={dashboard.totalOrders}
              icon={<FaClipboardList />}
              color="primary"
            />

            <Card
              title="Total Revenue"
              value={`₹${dashboard.revenue.toLocaleString(
                "en-IN")}`}
              icon={<FaMoneyBillWave />}
              color="success"
            />

            <Card
              title="Available Tables"
              value={dashboard.availableTables}
              icon={<FaChair />}
              color="warning"
            />

            <Card
              title="Total Staff"
              value={dashboard.totalStaff}
              icon={<FaUserFriends />}
              color="danger"
            />

            <Card
              title="Menu Items"
              value={dashboard.totalMenu}
              icon={<FaUtensils />}
              color="info"
            />

            <Card
              title="Categories"
              value={dashboard.totalCategories}
              icon={<FaListAlt />}
              color="secondary"
            />

            <Card
              title="Waiting Customers"
              value={dashboard.waitingCustomers}
              icon={<FaUsers />}
              color="warning"
            />

            <Card
              title="Total Bills"
              value={dashboard.totalBills}
              icon={<FaFileInvoiceDollar />}
              color="success"
            />
          </div>
          <DashboardBottom
            dashboard={dashboard}
          />
        </>
      )}

      {/* ================= MANAGER ======================= */}

      {CURRENT_ROLE === ROLES.MANAGER && (
        <>
          <div className="row g-3">
            <Card
              title="Total Orders"
              value={dashboard.totalOrders}
              icon={<FaClipboardList />}
              color="primary"
            />

            <Card
              title="Available Tables"
              value={dashboard.availableTables}
              icon={<FaChair />}
              color="success"
            />

            <Card
              title="Waiting Customers"
              value={dashboard.waitingCustomers}
              icon={<FaUsers />}
              color="warning"
            />

            <Card
              title="Revenue"
              value={`₹${dashboard.revenue.toLocaleString(
                "en-IN")}`}
              icon={<FaMoneyBillWave />}
              color="danger"
            />

            <Card
              title="Pending Orders"
              value={dashboard.pendingOrders}
              icon={<FaClock />}
              color="warning"
            />

            <Card
              title="Preparing Orders"
              value={dashboard.preparingOrders}
              icon={<FaUtensils />}
              color="primary"
            />

            <Card
              title="Ready Orders"
              value={dashboard.readyOrders}
              icon={<FaCheckCircle />}
              color="info"
            />

            <Card
              title="Completed Orders"
              value={dashboard.completedOrders}
              icon={<FaCheckCircle />}
              color="success"
            />
          </div>
          <DashboardBottom
            dashboard={dashboard}
          />
        </>
      )}

      {/* ================= WAITER ======================== */}

      {CURRENT_ROLE === ROLES.WAITER && (
        <div className="row g-3">
          <Card
            title="My Orders"
            value={dashboard.totalOrders}
            icon={<FaClipboardList />}
            color="primary"
          />

          <Card
            title="Available Tables"
            value={dashboard.availableTables}
            icon={<FaChair />}
            color="success"
          />

          <Card
            title="Pending Bills"
            value={dashboard.pendingBills}
            icon={<FaMoneyBillWave />}
            color="warning"
          />

          <Card
            title="Completed Orders"
            value={dashboard.completedOrders}
            icon={<FaCheckCircle />}
            color="success"
          />
        </div>
      )}

      {/* ================= KITCHEN ======================= */}

      {CURRENT_ROLE === ROLES.KITCHEN && (
        <>
          <div className="row g-3">
            <Card
              title="Pending Orders"
              value={dashboard.pendingOrders}
              icon={<FaClock />}
              color="warning"
            />

            <Card
              title="Preparing Orders"
              value={dashboard.preparingOrders}
              icon={<FaUtensils />}
              color="primary"
            />

            <Card
              title="Ready Orders"
              value={dashboard.readyOrders}
              icon={<FaCheckCircle />}
              color="success"
            />

            <Card
              title="Total Orders"
              value={dashboard.totalOrders}
              icon={<FaClipboardList />}
              color="danger"
            />
          </div>
          <DashboardBottom
            dashboard={dashboard}
          />
        </>
      )}

    </div>
  );
};

// RECENT ORDERS + TABLE STATUS
const DashboardBottom = ({ dashboard }) => {
  return (
    <div className="row g-3 mt-1">
      {/* ================= RECENT ORDERS ================= */}
      <div className="col-12 col-xl-8">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-header bg-white border-0 p-3">
            <h6 className="fw-bold mb-1">
              Recent Orders
            </h6>

            <p className="text-muted small mb-0">
              Latest restaurant orders
            </p>

          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle b mb-0">
              <thead className="table-warning">
                <tr>
                  <th>Order</th>
                  <th>Table</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {dashboard.recentOrders.length > 0 ? (
                  dashboard.recentOrders.map(
                    (order) => (
                      <tr key={order._id}>
                        <td className="fw-semibold">
                          {order.order_number}
                        </td>

                        <td>
                          {order.table_id?.tableNumber
                            ? `T${order.table_id.tableNumber}`
                            : "-"}
                        </td>

                        <td className="fw-semibold">
                          ₹
                          {Number(
                            order.grand_total || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        <td>
                          <span
                            className={`badge ${order.order_status ===
                              "Completed"
                              ? "bg-success"
                              : order.order_status ===
                                "Preparing"
                                ? "bg-warning text-dark"
                                : order.order_status ===
                                  "Ready"
                                  ? "bg-info"
                                  : "bg-secondary"
                              }`}
                          >
                            {order.order_status}
                          </span>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center text-muted py-4"
                    >
                      No recent orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= TABLE STATUS ================= */}
      <div className="col-12 col-xl-4">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-body p-3">
            <h6 className="fw-bold mb-1">
              Table Status
            </h6>

            <p className="text-muted small mb-3">
              Current table availability
            </p>

            <div className="row g-2">
              <TableStatus
                value={dashboard.availableTables}
                label="Available"
                color="success"
              />

              <TableStatus
                value={dashboard.occupiedTables}
                label="Occupied"
                color="danger"
              />

              <TableStatus
                value={dashboard.reservedTables}
                label="Reserved"
                color="warning"
              />

              <TableStatus
                value={dashboard.cleaningTables}
                label="Cleaning"
                color="info"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// TABLE STATUS CARD
const TableStatus = ({
  value,
  label,
  color,
}) => {
  return (
    <div className="col-6">
      <div className="border rounded-3 p-3 text-center">
        <FaChair
          className={`text-${color} mb-2`}
          size={18}
        />

        <h5 className="fw-bold mb-0">
          {value}
        </h5>

        <small className="text-muted">
          {label}
        </small>
      </div>
    </div>
  );
};

export default Dashboard;