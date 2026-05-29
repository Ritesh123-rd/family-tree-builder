const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

// Security: HTTP headers protection
app.use(helmet());

// Security: Rate limiting to prevent brute force / DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: { success: false, message: "Too many requests, please try again later" },
});
app.use("/api", limiter);

// Security: CORS - restrict to frontend origin only
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// Security: Body parser with size limit to prevent large payload attacks
app.use(express.json({ limit: "1mb" }));

// Security: Sanitize data to prevent NoSQL injection
app.use(mongoSanitize());

app.use("/api/members", require("./routes/memberRoutes"));

app.get("/", (req, res) => {
  res.send("Family Tree API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});