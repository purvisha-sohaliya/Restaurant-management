import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaAngleDown, FaAngleUp, } from "react-icons/fa";
import { sidebarConfig } from "../../config/sidebarConfig";
import { useAuth } from "../../context/AuthContext";
import { logout } from "../../services/authService";
import { AUTH_ROUTE } from "../../Constant/RoutesConstant";
import Swal from "sweetalert2";

const Sidebar = ({ sidebarOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState("");

  const CURRENT_ROLE = user?.role;
  const menus = sidebarConfig
    .filter((menu) => menu.roles?.includes(CURRENT_ROLE))
    .map((menu) => {
      if (!menu.children) {
        return menu;
      }

      return {
        ...menu,
        children: menu.children.filter(
          (child) =>
            !child.roles || child.roles.includes(CURRENT_ROLE)
        ),
      };
    })
    .filter((menu) => {
      if (!menu.children) return true;
      return menu.children.length > 0;
    });

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

  return (
    <div className="sidebar">
      <div
        className={`admin-sidebar position-fixed top-0 start-0 overflow-y-auto z-3 vh-100 p-3 
          ${sidebarOpen ? "sidebar-open" : "sidebar-closed"
          }`}
      >
        <div className="sidebar-logo text-white text-center mb-4 pb-3 ">
          <h4>{CURRENT_ROLE ? CURRENT_ROLE.toUpperCase() : ""}</h4>
        </div>
        <ul className="nav flex-column">
          {menus.map(menu => {
            const Icon = menu.icon;
            if (!menu.children) {
              return (
                <li
                  key={menu.title}
                  className="sidebar-item"
                  onClick={() => navigate(menu.path)}>
                  <Icon className="me-2" />
                  {menu.title}
                </li>
              );
            }

            return (
              <li key={menu.title}>
                <a className="nav-link text-white sidebar-item d-flex justify-content-between"
                  onClick={() =>
                    setOpenMenu(
                      openMenu === menu.title
                        ? ""
                        : menu.title
                    )
                  }
                >
                  <span>
                    <Icon className="me-2" />
                    {menu.title}
                  </span>
                  {
                    openMenu === menu.title
                      ? <FaAngleUp />
                      : <FaAngleDown />
                  }
                </a>
                {
                  openMenu === menu.title &&
                  <ul className="list-unstyled ms-4">
                    {
                      menu.children.map(sub => {
                        const SubIcon = sub.icon;
                        return (
                          <li
                            key={sub.title}
                            className="sidebar-sub-item"
                            onClick={() => navigate(sub.path)}
                          >
                            <SubIcon className="me-2" />
                            {sub.title}
                          </li>
                        );
                      })
                    }
                  </ul>
                }
              </li>
            );

          })}
          <div className="mt-auto pt-3">
            <button
              type="button"
              className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </ul>
      </div>
    </div>
  );

};

export default Sidebar;