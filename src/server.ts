const express = require("express");
const cors = require("cors");
const path = require("path");

const fileRoutes = require("./routes/files");
const scheduleRoutes = require("./routes/schedules");
const rightshipRoutes = require("./routes/rightship");
const userRoutes = require("./routes/user");
const expenseRoutes = require("./routes/expenseRoutes");
const authRoutes = require("./routes/authRoutes");
const inspectionRoutes = require("./routes/inspectionRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://dashboard-nexaportfrontend.vercel.app",
];

app.use(
  cors({
    origin: function (origin: string | undefined, callback: any) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json());

app.get("/", (_req: any, res: any) => {
  res.json({ success: true, message: "NexPort backend running" });
});

app.get("/health", (_req: any, res: any) => {
  res.json({ success: true, message: "Server healthy" });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/files", fileRoutes);
app.use("/schedules", scheduleRoutes);
app.use("/rightship", rightshipRoutes);
app.use("/user", userRoutes);
app.use("/expenses", expenseRoutes);
app.use("/api/auth", authRoutes);
app.use("/inspections", inspectionRoutes);
console.log("Server setup complete");

module.exports = app;