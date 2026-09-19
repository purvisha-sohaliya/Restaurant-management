export const AUTH_ROUTE = {
    LOGIN: "/login",
    REGISTER: "/register",
    ERROR: "*"
}
// Common Route
export const COMMON_ROUTE = {
    DASHBOARD: "/dashboard",
};
// super admin
export const SUPER_ADMIN_ROUTE = {
    RESTAURANTSLIST: "/RestaurantsList",
    RESTAURANTSADD: "/RestaurantsAdd",
    RESTAURANTSEDIT: "/RestaurantsEdit",

    // OWNER
    OWNERLIST: "/ownersList",
    OWNERADD: "/ownersAdd",
    OWNEREDIT: "/ownersEdit",

    REPORTS: "/Reports"
}
// sub admin
export const SUB_ADMIN_ROUTE = {
    CATEGORYLIST: "/category/list",
    CATEGORYADD: "/category/add",
    CATEGORYEDIT: "/category/edit/:id",

    // Menu Item
    MENULIST: "/menu-item",
    MENUADD: "/menu-item/add",
    MENUEDIT: "/menu-item/edit/:id",

    // Staff
    STAFFLIST: "/staff/list",
    STAFFADD: "/staff/add",
    STAFFEDIT: "/staff/edit",

    // Table 
    TABLE_LIST: "/table-list",
    TABLE_ADD: "/table-add",
    TABLE_EDIT: "/table-edit",
    PROFILE: "/profile",

    // Order
    ORDER_ADD: "/Order-add",
    ORDER_EDIT: "/Order-edit",
    ORDER_LIST: "/Order-list",

    // Activite
    ACTIVE_ORDERS: "/active-orders",

    // Bill
    BILL: "/bill",
    BILL_LIST: "/bill-list",

    // Waiting
    WAITINGQUEUE: "/waiting-queue",
    WATINGORDERCARD: "/waiting-order-card",
    TABLEASSINGMODAL: "/table-assign-modal",

    // Kitchen
    KITCHEN: "/kitchen",

    // LiveScreen
    LIVESCREEN: "/Livescreen",
    // inventoryList
    INVENTORY: "/Inventory",
};
