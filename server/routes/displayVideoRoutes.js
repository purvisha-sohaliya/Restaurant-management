const router = require("express").Router();
const { getDisplayVideos, addDisplayVideo } = require("../controllers/displayVideoController");
const isAuth = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

router.post("/videos", isAuth, authorizeRoles("super_admin"), upload.single("video"), addDisplayVideo);
router.get("/videos", isAuth, authorizeRoles("super_admin", "owner", "manager"), getDisplayVideos);

module.exports = router;