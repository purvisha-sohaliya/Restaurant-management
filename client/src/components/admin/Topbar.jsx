import React, { useState } from "react";
import { FaBell, FaBars, FaTimes } from "react-icons/fa";

const Topbar = ({ sidebarOpen, setSidebarOpen }) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  return (
    <header className="topbar sticky-top">
      <div className="container-fluid h-100 px-3 px-md-4">
        <div className="row h-100 align-items-center g-0">
          <div className="col d-flex align-items-center min-w-0">
            {/* Sidebar Toggle */}
            <button
              type="button"
              className="sidebar-toggle btn p-0 d-flex align-items-center justify-content-center flex-shrink-0"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <FaBars /> : <FaTimes />}
            </button>
            <div className="welcome-section ms-3 text-truncate">
              <h5 className="mb-0 text-truncate"> Welcome back, Admin 👋 </h5>
              <span className="d-none d-sm-block text-truncate"> Here's what's happening today. </span>
            </div>
          </div>
          <div className="col-auto">
            <div className="date-section">
              <input type="date" value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)} className="form-control form-control-sm date-input" />
            </div>
          </div>
          <div className="col-auto">
            <div className="topbar-actions d-flex align-items-center gap-2 gap-md-3">
              {/* Notification */}
              <button type="button" className="notification-btn btn position-relative d-flex align-items-center justify-content-center" aria-label="Notifications" >
                <FaBell />
                <span className="notification-badge"> 3
                </span>
              </button>
            
              <button type="button" className="profile-dropdown btn border-0 p-0 d-flex align-items-center" >
                <img src="https://ui-avatars.com/api/?name=Admin+User&background=3C6E71&color=fff" alt="Admin Profile" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;