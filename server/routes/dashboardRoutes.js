const router = require("express").Router();
const isAuth = require("../middleware/auth.middleware");
const { getDashboard } = require("../controllers/dashboardController");

router.get("/", isAuth, getDashboard);

module.exports = router;