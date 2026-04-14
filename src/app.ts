// backend/src/app.ts
import express from "express";
import cors from "cors";
import passport from "passport"; // <-- THE MISSING IMPORT
import jobRoutes from "./routes/job.routes";
import authRoutes from "./routes/auth.routes"; // <-- Import your new auth routes

const app = express();

app.use(cors());
app.use(express.json());

// Initialize Passport for authentication BEFORE your routes
app.use(passport.initialize());

// Connect your routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});