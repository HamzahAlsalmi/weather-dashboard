import { Router } from "express";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

interface City {
  id: string;
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;
}

const router = Router();

// ✅ Absolute path to searchHistory.json
const historyFilePath = path.join(
  process.cwd(),
  "server/data/searchHistory.json"
);

// ✅ Create file if missing
const ensureHistoryFileExists = () => {
  if (!fs.existsSync(historyFilePath)) {
    fs.mkdirSync(path.dirname(historyFilePath), { recursive: true });
    fs.writeFileSync(historyFilePath, "[]");
    console.log("📁 Created server/data/searchHistory.json");
  }
};

// ✅ POST /api/weather — Fetch weather and save to history
router.post("/", async (req, res) => {
  try {
    const { cityName } = req.body;
    console.log("🌆 Received city:", cityName);

    if (!cityName) {
      return res.status(400).json({ error: "City name is required." });
    }

    const API_KEY = process.env.OPENWEATHER_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: "Missing API key in .env" });
    }

    const weatherRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=imperial`
    );

    const data = weatherRes.data;

    const newEntry: City = {
      id: uuidv4(),
      city: data.name,
      date: new Date().toLocaleDateString(),
      icon: data.weather[0].icon,
      iconDescription: data.weather[0].description,
      tempF: data.main.temp,
      windSpeed: data.wind.speed,
      humidity: data.main.humidity,
    };

    ensureHistoryFileExists();
    const fileData = fs.readFileSync(historyFilePath, "utf8");
    const history: City[] = fileData ? JSON.parse(fileData) : [];

    history.push(newEntry);
    fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2));

    res.json([newEntry]);
  } catch (error: any) {
    console.error(
      "❌ Error fetching weather:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

// ✅ GET /api/weather/history — Read search history
router.get("/history", (_req, res) => {
  try {
    ensureHistoryFileExists();
    const historyData = fs.readFileSync(historyFilePath, "utf8");
    const history: City[] = historyData ? JSON.parse(historyData) : [];
    res.json(history);
  } catch (error) {
    console.error("❌ Error reading search history:", error);
    res.status(500).json({ error: "Failed to read search history" });
  }
});

// ✅ DELETE /api/weather/history/:id — Delete a city
router.delete("/history/:id", (req, res) => {
  try {
    ensureHistoryFileExists();
    const historyData = fs.readFileSync(historyFilePath, "utf8");
    let history: City[] = historyData ? JSON.parse(historyData) : [];

    history = history.filter((entry) => entry.id !== req.params.id);
    fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2));

    res.json({ message: "City deleted from search history" });
  } catch (error) {
    console.error("❌ Error deleting city:", error);
    res
      .status(500)
      .json({ error: "Failed to delete city from search history" });
  }
});

export default router;
