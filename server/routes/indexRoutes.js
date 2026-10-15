const router = require("express").Router();

const USERS = require("./userRoutes");
const RESTAURANT = require("./restaurantRoutes");
const OWNERS = require("./ownerRoutes");
const CATEGORIES = require("./categoryRoutes");
const MENUITEMS = require("./menuitemsRoutes");
const TABLES = require("./tableRoutes");
const STAFF = require("./staffRoute");
const ORDERS = require("./orderRoute");
const BILLING = require("./billingRoutes");
const WAITING = require("./waitingRoutes");
const KITCHEN = require("./kitchenRoutes");
const CUSTOMERS = require("./customerRoutes");
const DISPLAY = require("./displayVideoRoutes");
const RECIPE = require("./recipeRoutes");
const INVENTORY = require("./inventoryRoutes");
const DASHBOARD = require("./dashboardRoutes");
const SUBSCRIPTIONPLAN = require("./subscriptionPlanRoutes");

router.use("/restaurants", RESTAURANT);
router.use("/owners", OWNERS);
router.use("/categories", CATEGORIES);
router.use("/menu-items", MENUITEMS);
router.use("/tables", TABLES);
router.use("/staff", STAFF);
router.use("/orders", ORDERS);
router.use("/bills", BILLING);
router.use("/waiting", WAITING);
router.use("/kitchen", KITCHEN);
router.use("/customers", CUSTOMERS);
router.use("/display-videos", DISPLAY);
router.use("/recipes", RECIPE);
router.use("/inventory", INVENTORY);
router.use("/dashboard", DASHBOARD);
router.use("/subscription-plans", SUBSCRIPTIONPLAN);

router.use("/users", USERS);
module.exports = router;