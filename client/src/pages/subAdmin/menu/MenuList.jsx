import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaEyeSlash, FaEye, FaUndo, FaPlus, FaUtensils } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getMenuItems, deleteMenuItem, restoreMenuItem, changeMenuItemStatus, } from "../../../services/menuItemService";
import { SUB_ADMIN_ROUTE } from "../../../Constant/RoutesConstant";

function MenuList() {
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [showAll, setShowAll] = useState(false);

  // Fetch
  const fetchData = async () => {
    try {
      const res = await getMenuItems();
      setMenus(res?.data || []);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  // Filter
  const filteredMenus = menus.filter((menu) => {
    const categoryMatch =
      !selectedCategory ||
      menu.category_id?._id === selectedCategory;
    return categoryMatch;
  });

  const categories = [
    ...new Map(
      menus
        .filter((m) => m.category_id)
        .map((m) => [m.category_id._id, m.category_id])
    ).values(),
  ];

  // Select
  const handleSelect = (id) => {
    setSelectedMenus((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  // Delete
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This menu item will be deleted!",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      await deleteMenuItem(id);

      setMenus((prev) =>
        prev.map((m) =>
          m._id === id ? { ...m, is_deleted: true } : m
        )
      );

      Swal.fire("Deleted!", "Menu item deleted", "success");
    }
  };

  // Restore
  const handleRecover = async (id) => {
    const result = await Swal.fire({
      title: "Restore item?",
      showCancelButton: true,
      confirmButtonColor: "green",
      confirmButtonText: "Restore",
    });

    if (result.isConfirmed) {
      await restoreMenuItem(id);

      setMenus((prev) =>
        prev.map((m) =>
          m._id === id ? { ...m, is_deleted: false } : m
        )
      );

      Swal.fire("Restored!", "Menu item restored", "success");
    }
  };

  // Status Toggle
  const handleToggleStatus = async (id) => {
    try {
      const item = menus.find((m) => m._id === id);
      const newStatus =
        item.status === "active" ? "inactive" : "active";

      const res = await changeMenuItemStatus(id, newStatus);

      setMenus((prev) =>
        prev.map((m) =>
          m._id === id
            ? { ...m, status: res?.data?.status }
            : m
        )
      );
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <div className="container-fluid py-4">

      {/* HEADER */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-bold mb-1">Menu Management</h2>
          <small className="text-muted">
            Manage restaurant menu items
          </small>
        </div>

        <button type="button" className="btn btn-success"
          onClick={() => navigate(SUB_ADMIN_ROUTE.MENUADD)}>
          <FaPlus className="me-2" />Add Menu
        </button>
      </div>

      {/* ================== Owner Table ================== */}

      {/* FILTER */}
      <div className="row mb-4">
        <div className="col-12 col-sm-8 col-md-6 col-lg-4">
          <select className="form-select" value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}>

            <option value="">All Categories </option>

            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MENU ITEMS */}
      <div className="row g-4">
        {filteredMenus.length > 0 ? (
          (showAll ? filteredMenus : filteredMenus.slice(0, 12)).map((menu) => (
            <div className="col-xl-3 col-lg-4 col-md-6 col-6 mb-2"
              key={menu._id} >
              <div
                className={`card border-0 shadow-sm h-100 overflow-hidden rounded-4 ${menu.is_deleted ? "deleted-menu" : "bg-white"
                  }`}
                onClick={() => setSelectedMenu(menu)}
                style={{ cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease", }}>
                {/* IMAGE */}
                <div className="position-relative p-2 pb-0">
                  <div className="position-relative overflow-hidden rounded-3 bg-light"
                    style={{ height: "165px", }}>
                    <img src={menu.image || "https://via.placeholder.com/400x220?text=No+Image"}
                      alt={menu.item_name} className="w-100 h-100" style={{ objectFit: "cover" }} />

                    {/* CHECKBOX */}
                    <div className="position-absolute top-0 start-0 m-3"
                      onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox"
                        className="form-check-input shadow-sm"
                        style={{ width: "18px", height: "18px", cursor: "pointer", }}
                        checked={selectedMenus.includes(menu._id)}
                        onChange={() => handleSelect(menu._id)} />
                    </div>

                    {/* STATUS */}
                    <span className={`badge position-absolute top-0 end-0 m-3 rounded-pill px-3 py-2 ${menu.status === "active"
                      ? "bg-success"
                      : "bg-danger"
                      }`}  >
                      {menu.status}
                    </span>

                    {/* DELETED LABEL */}
                    {menu.is_deleted && (
                      <span className="badge bg-danger position-absolute bottom-0 start-0 m-3 rounded-pill px-3 py-2">
                        Deleted
                      </span>
                    )}
                  </div>
                </div>

                {/* BODY */}
                <div className="card-body px-3 pt-2 pb-1">
                  <h6
                    className="fw-bold text-dark mb-2 text-truncate"
                    title={menu.item_name}>
                    {menu.item_name}
                  </h6>

                  <div className="rounded-3 p-2 bg-light">
                    {/* CATEGORY */}
                    <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
                      <span className="text-secondary small">
                        Category
                      </span>

                      <span
                        className="fw-semibold small text-dark text-truncate"
                        style={{ maxWidth: "55%" }}
                        title={menu.category_id?.category_name || "-"}>
                        {menu.category_id?.category_name || "-"}
                      </span>
                    </div>

                    {/* PRICE */}
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-secondary small">
                        Price
                      </span>

                      <span className="fw-bold text-success">
                        ₹{Number(menu.price || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* CREATED */}
                    <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
                      <span className="text-secondary small">
                        Created
                      </span>

                      <span className="fw-semibold small text-dark">
                        {menu.createdAt
                          ? new Date(menu.createdAt).toLocaleDateString("en-IN")
                          : "-"}
                      </span>
                    </div>

                    {/* STATUS */}
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-secondary small">
                        Visibility
                      </span>

                      <span
                        className={`badge rounded-pill px-2 py-1 ${menu.status === "active"
                          ? "bg-success-subtle text-success"
                          : "bg-danger-subtle text-danger"
                          }`} >
                        {menu.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="card-footer bg-white border-0 px-3 pb-2">
                  <div className="d-flex align-items-center justify-content-between gap-2">
                    {/* EDIT */}
                    <button
                      type="button"
                      className="btn rounded-3 flex-fill py-1 bg-light text-primary"
                      title="Edit Menu" disabled={menu.is_deleted}
                      onClick={(e) => { e.stopPropagation(); navigate(`${SUB_ADMIN_ROUTE.MENUEDIT}/${menu._id}`); }}>
                      <FaEdit />
                    </button>

                    {/* DELETE / RESTORE */}
                    {menu.is_deleted ? (
                      <button type="button" className="btn rounded-3 flex-fill py-1 bg-light text-success"
                        title="Restore Menu" onClick={(e) => { e.stopPropagation(); handleRecover(menu._id); }} >
                        <FaUndo />
                      </button>
                    ) : (
                      <button type="button" className="btn rounded-3 flex-fill py-1 bg-light text-danger"
                        title="Delete Menu"
                        onClick={(e) => { e.stopPropagation(); handleDelete(menu._id); }} >
                        <FaTrash />
                      </button>
                    )}

                    {/* VISIBILITY */}
                    <button type="button" className="btn rounded-3 flex-fill py-1"
                      style={{
                        background:
                          menu.status === "active" ? "#fff5df" : "#e8f8ef",
                        color:
                          menu.status === "active" ? "#b77900" : "#198754",
                      }}
                      title={menu.status === "active"
                        ? "Deactivate Menu"
                        : "Activate Menu"
                      }
                      disabled={menu.is_deleted}
                      onClick={(e) => { e.stopPropagation(); handleToggleStatus(menu._id); }}>
                      {menu.status === "active" ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5">
            <FaUtensils size={35} className="text-secondary mb-3" />
            <h5 className="fw-bold">No Menu Items Found</h5>
            <p className="text-muted small mb-0">
              Menu items will appear here when added.
            </p>
          </div>
        )}
      </div>

      {filteredMenus.length > 12 && (
        <div className="d-flex justify-content-center mt-4 mb-4">
          <button
            type="button"
            className="btn btn-outline-primary rounded-pill px-4 py-2"
            onClick={() => setShowAll((prev) => !prev)}>
            {showAll ? "See Less" : "See More"}
          </button>
        </div>
      )}
      {/* ================= MENU ITEM DETAILS MODAL ================= */}

      {selectedMenu && (
        <div className="modal d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(5px)",
          }} onClick={() => setSelectedMenu(null)}>
          <div
            className="modal-dialog modal-dialog-centered modal-lg "
            style={{ width: "500px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content  border-0 overflow-hidden rounded-4 shadow-lg">

              {/* IMAGE HEADER */}
              <div className="position-relative" style={{ height: "250px" }}>
                <img src={selectedMenu.image ||
                  "https://via.placeholder.com/700x400?text=No+Image"
                }
                  alt={selectedMenu.item_name}
                  className="w-100 h-100" style={{ objectFit: "cover" }} />

                {/* DARK OVERLAY */}
                <div className="position-absolute top-0 start-0 w-100 h-100"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent 60%)", }}>

                </div>

                {/* CLOSE */}
                <button type="button"
                  className="btn btn-light rounded-circle position-absolute top-0 end-0 m-3 shadow"
                  style={{
                    width: "40px", height: "40px",
                  }}
                  onClick={() => setSelectedMenu(null)}
                >
                  ×
                </button>

                {/* ITEM NAME */}
                <div className="position-absolute bottom-0 start-0 p-4 text-white">
                  <small className="opacity-75">
                    Menu Item
                  </small>

                  <h2 className="fw-bold mb-1">
                    {selectedMenu.item_name}
                  </h2>

                  <span className="badge bg-light text-dark rounded-pill px-3 py-2">
                    {selectedMenu.category_id?.category_name || "Uncategorized"}
                  </span>
                </div>

                {/* STATUS */}
                <span
                  className={`badge position-absolute top-0 start-0 m-3 rounded-pill px-3 py-2 ${selectedMenu.status === "active"
                    ? "bg-success"
                    : "bg-danger"
                    }`}
                >
                  {selectedMenu.status}
                </span>
              </div>

              {/* BODY */}
              <div className="modal-body p-4">

                {/* PRICE + CREATED */}
                <div className="row g-3 mb-4">

                  <div className="col-md-6">
                    <div className="border rounded-4 p-3 d-flex align-items-center justify-content-between">
                      <div>
                        <small className="text-muted d-block">
                          Price
                        </small>

                        <h3 className="fw-bold text-success mb-0">
                          ₹{selectedMenu.price}
                        </h3>
                      </div>

                      <div
                        className="bg-success-subtle rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "50px",
                          height: "50px",
                        }}
                      >
                        ₹
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded-4 p-3">
                      <small className="text-muted d-block">
                        Created Date
                      </small>

                      <h6 className="fw-bold mb-0 mt-1">
                        {selectedMenu.createdAt
                          ? new Date(
                            selectedMenu.createdAt
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                          : "-"}
                      </h6>
                    </div>
                  </div>

                </div>

                {/* DESCRIPTION */}
                <div className="bg-light rounded-4 p-4">
                  <h6 className="fw-bold mb-2">
                    About this item
                  </h6>

                  <p className="text-muted mb-0 lh-lg">
                    {selectedMenu.description ||
                      "No description available for this menu item."}
                  </p>
                </div>

              </div>

              {/* FOOTER */}
              <div className="modal-footer border-0 px-4 pb-4 pt-0">

                <button
                  type="button"
                  className="btn btn-light rounded-3 px-4"
                  onClick={() => setSelectedMenu(null)}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="btn btn-dark rounded-3 px-4"
                  disabled={selectedMenu.is_deleted}
                  onClick={() => {
                    navigate(
                      `${SUB_ADMIN_ROUTE.MENUEDIT}/${selectedMenu._id}`
                    );

                    setSelectedMenu(null);
                  }}
                >
                  <FaEdit className="me-2" />
                  Edit Item
                </button>

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuList;