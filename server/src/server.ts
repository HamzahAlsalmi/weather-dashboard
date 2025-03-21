import dotenv from "dotenv";
import express from "express";
import path from "path";
import cors from "cors"; // Import CORS middleware
import weatherRoutes from "./routes/api/weatherRoutes.js"; // Use `.js` for ESModules

dotenv.config();

const app = express();

// ✅ Use a different port than Vite
const PORT = process.env.PORT || 3001;

// ✅ Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Use CORS to allow requests from your frontend domain
app.use(
  cors({
    origin: "https://weather-dashboard-3-0mc4.onrender.com", // Update with your frontend URL
  })
);

// ✅ Serve static frontend (adjust path as needed)
const clientDistPath = path.resolve("../client/dist");
app.use(express.static(clientDistPath));

// ✅ API routes
app.use("/api/weather", weatherRoutes);

// ✅ Optional health check route
app.get("/", (_req, res) => {
  res.send("🌦️ Weather API is live!");
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🌦️  Listening on http://localhost:${PORT}`);
});
