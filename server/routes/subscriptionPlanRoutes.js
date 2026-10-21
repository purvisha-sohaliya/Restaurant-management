const router = require("express").Router();
const isAuth = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const { createSubscriptionPlan, getSubscriptionPlans, updateSubscriptionPlan, deleteSubscriptionPlan, changeSubscriptionPlanStatus, activateSubscription, getSubscriptionStatus } = require("../controllers/subscriptionPlanController");

router.post("/", isAuth, authorizeRoles("super_admin"), createSubscriptionPlan);
router.get("/", isAuth, authorizeRoles("super_admin", "owner"), getSubscriptionPlans);
router.put("/:id", isAuth, authorizeRoles("super_admin"), updateSubscriptionPlan);
router.delete("/:id", isAuth, authorizeRoles("super_admin"), deleteSubscriptionPlan);
router.patch("/:id/status", isAuth, authorizeRoles("super_admin"), changeSubscriptionPlanStatus);
router.post("/activate", isAuth, authorizeRoles("owner"), activateSubscription);
router.get( "/status", isAuth, authorizeRoles("owner"), getSubscriptionStatus);

module.exports = router;