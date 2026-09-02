import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import Topbar from "../components/admin/Topbar";

const AdminLayout = () => {
  return ( 
    <div className="admin-layout d-flex min-vh-100">
      <Sidebar />

      <div className="admin-main main-content flex-grow-1 min-vh-100 d-flex flex-column">
        <Topbar />

        <main className="content-area flex-grow-1 p-4">
          <Outlet />
        </main>s
      </div>
    </div>
  );
};

export default AdminLayout;