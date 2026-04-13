// backend/src/app.ts
import express from "express";
import cors from "cors";
import jobRoutes from "./routes/job.routes"; // Import the routes

const app = express();

app.use(cors());
app.use(express.json());

// Connect the job routes to the /api/jobs path
app.use("/api/jobs", jobRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});