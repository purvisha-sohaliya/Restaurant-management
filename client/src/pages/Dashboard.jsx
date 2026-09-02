import React, { useEffect, useState } from "react";
import { FaUtensils, FaChair, FaUsers, FaMoneyBillWave, FaClock, FaCheckCircle, FaStore, FaUserTie, FaUserFriends, FaClipboardList, FaListAlt, FaFileInvoiceDollar } from "react-icons/fa";
import { ROLES } from "../Constant/CommonConstant";
import StatCard from "../components/admin/StatCard";
import { getOrders } from "../services/orderService";
import { getAllTables } from "../services/tableservice";
import { getWaitingList } from "../services/waitingService";
import { getStaff } from "../services/staffService";
import { getRestaurants } from "../services/restaurant.service";
import { getBills } from "../services/billService";
import { getCategories } from "../services/categoryService";
import { getMenuItems } from "../services/menuItemService";
import { useAuth } from "../context/AuthContext";
import { getOwners } from "../services/ownerService";

function Dashboard() {
  const { user } = useAuth();
  const CURRENT_ROLE = user?.role;
  const [dashboard, setDashboard] = useState({
    totalOrders: 0,
    revenue: 0,
    availableTables: 0,
    totalStaff: 0,
    totalOwners: 0,
    totalMenu: 0,
    totalCategories: 0,
    activeOrders: 0,
    waitingCustomers: 0,
    totalBills: 0,
  });
  useEffect(() => {
    if (user?.role) {
      loadDashboard();
    }
  }, [user?.role]);

  const loadDashboard = async () => {
    try {
      console.log("CURRENT ROLE:", CURRENT_ROLE);
      console.log("SUPER ADMIN:", ROLES.SUPER_ADMIN);

      const [
        ordersRes,
        tablesRes,
        waitingRes,
        staffRes,
        restaurantRes,
        billsRes,
        categoryRes,
        menuRes
      ] = await Promise.allSettled([
        getOrders(),
        getAllTables(),
        getWaitingList(),
        getStaff(),
        getRestaurants(),
        getBills(),
        getCategories(),
        getMenuItems()
      ]);


      // ORDERS

      const orders =
        ordersRes.status === "fulfilled"
          ? ordersRes.value?.data || []
          : [];

      // TABLES
      const tables =
        tablesRes.status === "fulfilled"
          ? tablesRes.value?.data || []
          : [];


      // WAITING    
      const waiting =
        waitingRes.status === "fulfilled"
          ? waitingRes.value?.data || []
          : [];


      // STAFF
      const staff =
        staffRes.status === "fulfilled"
          ? staffRes.value?.data || []
          : [];


      // RESTAURANTS
      const restaurantData =
        restaurantRes.status === "fulfilled"
          ? restaurantRes.value
          : [];

      const restaurants = Array.isArray(restaurantData)
        ? restaurantData
        : restaurantData?.data || [];

      // BILLS
      const bills =
        billsRes.status === "fulfilled"
          ? billsRes.value?.data || []
          : [];

      // CATEGORIES
      const categoriesData =
        categoryRes.status === "fulfilled"
          ? categoryRes.value?.data || []
          : [];

      const categories = categoriesData.filter(
        (category) => !category.isDeleted
      );

      // MENU
      const menusData =
        menuRes.status === "fulfilled"
          ? menuRes.value?.data || []
          : [];

      const menus = menusData.filter(
        (item) => !item.is_deleted
      );

      // OWNERS
      // OWNERS
      let owners = [];

      if (CURRENT_ROLE === ROLES.SUPER_ADMIN) {
        try {
          const ownersRes = await getOwners();
          owners = ownersRes?.data || [];
        } catch (error) {
          console.error("OWNERS ERROR:", error);
        }
      }

      // ORDER COUNTS
      const pendingOrders = orders.filter(
        (o) => o.status === "Pending"
      ).length;

      const completedOrders = orders.filter(
        (o) => o.status === "Completed"
      ).length;

      // BILLS
      const pendingBills = bills.filter(
        (bill) => bill.payment_status === "Pending"
      ).length;

      // TABLES
      const availableTables = tables.filter(
        (table) => table.status === "available"
      ).length;

      // REVENUE
      const revenue = orders
        .filter((o) => o.status === "Completed")
        .reduce(
          (sum, order) =>
            sum + Number(order.total_amount || 0),
          0
        );



      // SET DASHBOARD
      setDashboard({
        totalOrders: orders.length,
        pendingOrders,
        completedOrders,
        availableTables,
        pendingBills,
        waitingCustomers: waiting.length,
        totalStaff: staff.length,
        totalOwners: owners.length,
        totalRestaurants: restaurants.length,
        revenue,
        totalMenu: menus.length,
        totalCategories: categories.length,
        totalBills: bills.length,
        todayOrders: orders.length,
      });

    } catch (error) {
      console.error("DASHBOARD ERROR:", error);
    }
  };
  return (
    <div className="container-fluid py-4">

      <div className="card border-0 shadow mb-4 bg-blue text-white">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1">
              Welcome Back 👋
            </h2>
            <p className="mb-0">
              Restaurant Management Dashboard
            </p>
          </div>

          <div className="text-end">
            <h5>{new Date().toDateString()}</h5>
            <small>Today's Overview</small>
          </div>
        </div>
      </div>
      {/* SUPER ADMIN */}
      {CURRENT_ROLE === ROLES.SUPER_ADMIN && (
        <>
          <h3 className="fw-bold mb-4">Super Admin Dashboard</h3>

          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Restaurants"
                value={dashboard.totalRestaurants}
                icon={<FaStore />}
                color="primary"
              />
            </div>



            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Owners"
                value={dashboard.totalOwners}
                icon={<FaUserTie />}
                color="success"
              />
            </div>

            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Revenue"
                value={`₹${dashboard.revenue.toLocaleString()}`}
                icon={<FaMoneyBillWave />}
                color="danger" />
            </div>

            {/* <div className="col-lg-3 col-md-6">
              <StatCard
                title="Category"
                value={dashboard.totalCategories}
                icon={<FaStore />}
                color="primary" />
            </div> */}
          </div>
        </>
      )}

      {/* OWNER */}
      {CURRENT_ROLE === ROLES.OWNER && (
        <>
          <h3 className="fw-bold mb-4">Owner Dashboard</h3>

          <div className="row g-4">

            {/* Orders */}
            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Orders"
                value={dashboard.totalOrders}
                icon={<FaClipboardList />}
                color="primary"
              />
            </div>

            {/* Revenue */}
            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Revenue"
                value={`₹${dashboard.revenue}`}
                icon={<FaMoneyBillWave />}
                color="success"
              />
            </div>

            {/* Tables */}
            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Tables"
                value={dashboard.availableTables}
                icon={<FaChair />}
                color="warning"
              />
            </div>

            {/* Staff */}
            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Staff"
                value={dashboard.totalStaff}
                icon={<FaUserFriends />}
                color="danger"
              />
            </div>

            {/* Menu */}
            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Menu"
                value={dashboard.totalMenu}
                icon={<FaUtensils />}
                color="info"
              />
            </div>

            {/* Categories */}
            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Categories"
                value={dashboard.totalCategories}
                icon={<FaListAlt />}
                color="secondary"
              />
            </div>


            {/* Waiting List */}
            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Waiting List"
                value={dashboard.waitingCustomers}
                icon={<FaUsers />}
                color="warning"
              />
            </div>

            {/* Bill List */}
            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Bill List"
                value={dashboard.totalBills}
                icon={<FaFileInvoiceDollar />}
                color="success"
              />
            </div>

          </div>
        </>
      )}

      {/* MANAGER */}
      {CURRENT_ROLE === ROLES.MANAGER && (
        <>
          <h3 className="fw-bold mb-4">Manager Dashboard</h3>

          <div className="row g-4">

            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Total Orders"
                value={dashboard.totalOrders}
                icon={<FaUtensils />}
                color="primary"
              />            </div>

            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Available Tables"
                value={dashboard.availableTables}
                icon={<FaChair />}
                color="success"
              />
            </div>

            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Waiting Customers"
                value={dashboard.waitingCustomers}
                icon={<FaUsers />}
                color="warning"
              />
            </div>

            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Revenue"
                value={`₹${dashboard.revenue}`}
                icon={<FaMoneyBillWave />}
                color="danger"
              />
            </div>

            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Pending Orders"
                value={dashboard.pendingOrders}
                icon={<FaClock />}
                color="warning"
              />
            </div>

            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Completed Orders"
                value={dashboard.completedOrders}
                icon={<FaCheckCircle />}
                color="success"
              />
            </div>

          </div>
        </>
      )}

      {/* WAITER */}
      {CURRENT_ROLE === ROLES.WAITER && (
        <>
          <h3 className="fw-bold mb-4">Waiter Dashboard</h3>

          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <StatCard
                title="My Orders"
                value={dashboard.totalOrders}
                icon={<FaUtensils />}
                color="primary" />
            </div>

            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Assigned Tables"
                value={dashboard.availableTables}
                icon={<FaChair />}
                color="success"
              />            </div>

            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Pending Bills"
                value={dashboard.pendingBills}
                icon={<FaMoneyBillWave />}
                color="warning"
              />           </div>

            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Completed Orders"
                value={dashboard.completedOrders}
                icon={<FaCheckCircle />}
                color="danger"
              />            </div>
          </div>
        </>
      )}

      {/* KITCHEN */}
      {CURRENT_ROLE === ROLES.KITCHEN && (
        <>
          <h3 className="fw-bold mb-4">Kitchen Dashboard</h3>

          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Pending Orders"
                value={dashboard.pendingOrders}
                icon={<FaClock />}
                color="warning"
              />            </div>

            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Preparing"
                value={dashboard.pendingOrders}
                icon={<FaUtensils />}
                color="primary" />
            </div>

            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Ready Orders"
                value={dashboard.completedOrders}
                icon={<FaCheckCircle />}
                color="success" />
            </div>

            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Today's Orders"
                value={dashboard.todayOrders}
                icon={<FaClipboardList />}
                color="danger" />
            </div>
          </div>
        </>
      )}

    </div>
  );
}

export default Dashboard;