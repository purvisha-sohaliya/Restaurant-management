import React, { useEffect, useState, useCallback } from "react";
import { FaBell, FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { AUTH_ROUTE } from "../../Constant/RoutesConstant";
import Swal from "sweetalert2";
import { logout } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { getSubscriptionStatus } from "../../services/subscriptionPlanService";


const Topbar = ({ sidebarOpen, setSidebarOpen }) => {

  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const [trialDaysLeft, setTrialDaysLeft] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]);
  const [profileOpen, setProfileOpen] = useState(false);

  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to logout?",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });
    if (!result.isConfirmed) {
      return;
    }
    try {
      const data = await logout();
      await Swal.fire({
        title: "Logged out!",
        text: data.message,
        timer: 1500,
        showConfirmButton: false,
      });
      navigate(AUTH_ROUTE.LOGIN, { replace: true });
      window.location.reload();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Logout failed",
        text: error?.response?.data?.message || "Something went wrong",
      });
    }
  };


  useEffect(() => {
    if (user?.role?.toLowerCase() === "owner") {
      fetchTrialStatus();
    }
  }, [user?.role]);



  const fetchTrialStatus = useCallback(async () => {
    try {
      const response = await getSubscriptionStatus();

      if (response?.success && response?.data) {
        setTrialDaysLeft(response.data.remaining_days ?? 0);
        setSubscriptionStatus(response.data.status ?? "inactive");
      }
    } catch (error) {
      console.error(
        "Subscription Status Error:",
        error.response?.data || error.message
      );
    }
  }, []);

  useEffect(() => {
    if (user?.role?.toLowerCase() !== "owner") {
      return;
    }

    fetchTrialStatus();

    const intervalId = setInterval(() => {
      fetchTrialStatus();
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [user?.role, fetchTrialStatus]);


  return (
    <header className="topbar sticky-top">
      <div className="container-fluid h-100 px-3 px-md-4">
        <div className="row h-100 align-items-center g-0">
          <div className="col d-flex align-items-center min-w-0">
            {/* Sidebar Toggle */}
            <button type="button"
              className="sidebar-toggle btn p-0 d-flex align-items-center justify-content-center flex-shrink-0"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar">
              {sidebarOpen ? <FaBars /> : <FaTimes />}
            </button>
            <div className="welcome-section ms-3 text-truncate">
              <h5 className="mb-0 text-truncate">Welcome back, {user?.name || "User"} 👋 </h5>
              <span className="d-none d-sm-block text-truncate">
                Here's what's happening today
              </span>
            </div>
          </div>
          <div className="col-auto">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              {user?.role?.toLowerCase() === "owner" && (
                <span
                  className={`badge rounded-pill px-3 py-2 ${subscriptionStatus === "active" && trialDaysLeft > 0
                      ? "bg-success"
                      : "bg-danger"
                    }`}>
                  {trialDaysLeft === null || subscriptionStatus === null
                    ? "Loading..."
                    : subscriptionStatus !== "active" || trialDaysLeft === 0
                      ? "Trial Expired"
                      : `Free Trial: ${trialDaysLeft} Days Left`}
                </span>
              )}

              <div className="date-section">
                <input type="date" value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)} className="form-control form-control-sm date-input" />
              </div>
            </div>
          </div>
          <div className="col-auto">
            <div className="topbar-actions d-flex align-items-center gap-2 gap-md-3">
              {/* Notification */}
              <button type="button" className="notification-btn btn position-relative d-flex align-items-center justify-content-center"
                aria-label="Notifications">
                <FaBell />

                {notifications?.length > 0 && (
                  <span className="notification-badge">
                    {notifications.length}
                  </span>
                )}
              </button>
              <div className="position-relative">
                <button
                  type="button"
                  className="profile-dropdown btn border-0 p-0 d-flex align-items-center"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user?.name?.charAt(0).toUpperCase() || "U"
                    )}&background=3C6E71&color=fff`}
                    alt={user?.name || "User Profile"}
                  />
                </button>

                {profileOpen && (
                  <div
                    className="position-absolute end-0 mt-2 bg-white shadow-lg rounded-4 p-3"
                    style={{ width: "260px", zIndex: 1050, }}>

                    <div className="d-flex align-items-center gap-3 mb-3 ">
                      <img className="rounded-circle"
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user?.name?.charAt(0).toUpperCase() || "U"
                        )}&background=3C6E71&color=fff`}
                        alt={user?.name || "User"}
                        style={{ width: "48px", height: "48px", }} />

                      <div>
                        <h6 className="mb-0 fw-bold">
                          {user?.name || "User"}
                        </h6>

                        <small className="text-muted">
                          {user?.role?.replace("_", " ") || "User"}
                        </small>
                      </div>
                    </div>

                    <hr />

                    <div className="mb-3">
                      <small className="text-muted d-block">
                        Email
                      </small>

                      <span className="fw-semibold">
                        {user?.email || "-"}
                      </span>
                    </div>

                    <div className="mb-3">
                      <small className="text-muted d-block">
                        Phone
                      </small>

                      <span className="fw-semibold">
                        {user?.phone || "-"}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                      onClick={handleLogout}>
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;