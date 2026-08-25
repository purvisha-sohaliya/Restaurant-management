const PORT = process.env.PORT || 5000;
require("dotenv").config({ quiet: true });

const express = require("express");
const { connectDB } = require("./config/db");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const INDEX_ROUTE = require("./routes/indexRoutes");
const errorHandler = require("./middleware/error.middleware");
const notFound = require("./middleware/notFound");
const path = require("path");
const { defaultAdmin } = require("./utils/default.admin");

const app = express();
connectDB();
defaultAdmin();
app.use(helmet());

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
}));

app.use(morgan("dev"));

app.use(express.json());

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"), {
        setHeaders: (res) => {
            res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        }
    })
);

app.use("/api", INDEX_ROUTE);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});