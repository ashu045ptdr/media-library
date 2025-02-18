require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const routes = require("./routes");

const app = express();
app.use(express.json());
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });
app.use("/api", routes(upload));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
