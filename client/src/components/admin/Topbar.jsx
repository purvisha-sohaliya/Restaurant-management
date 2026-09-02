import React from 'react';
import { FaSearch, FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/authService';



const Topbar = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      const data = await logout();
      alert(data.message);
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="topbar sticky-top d-flex align-items-center justify-content-between ">
      <div className="search-bar ">
        <FaSearch className="search-icon " />
        <input className='w-100 bg-light border' type="text" placeholder="Search..." />
      </div>
      <div className="topbar-actions d-flex align-items-center gap-3">
        <button className="notification-btn">
          <FaBell />
          <span className="notification-badge">3</span>
        </button>
        <div className="profile-dropdown">
          <img src="https://ui-avatars.com/api/?name=Admin+User&background=3C6E71&color=fff" alt="Admin Profile" />
          <span>Admin</span>
          <button
            type="button"
            className="btn btn-danger d-flex align-items-center gap-2"
            onClick={handleLogout}>

            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
