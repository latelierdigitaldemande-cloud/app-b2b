import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Mock Database
  const fleets = [
    {
      id: "fleet-1",
      name: "Elite Sedans",
      description: "Premium black car service specializing in executive travel and airport transfers.",
      rating: 4.9,
      baseRate: 45,
      ratePerKm: 2.5,
      availability: "High",
      fleetSize: 24,
      vehicleTypes: ["Luxury Sedan", "Executive SUV"],
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800",
      features: ["Wifi", "Water", "Chauffeur", "Flight Tracking"]
    },
    {
      id: "fleet-2",
      name: "Metro Shuttles",
      description: "Reliable group transportation for company events and daily employee commutes.",
      rating: 4.7,
      baseRate: 30,
      ratePerKm: 1.8,
      availability: "Medium",
      fleetSize: 12,
      vehicleTypes: ["Minivan", "Executive Van"],
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800",
      features: ["Wheelchair Accessible", "High Capacity", "Route Optimization"]
    },
    {
      id: "fleet-3",
      name: "GreenCommute",
      description: "100% Electric fleet for sustainable business travel requirements.",
      rating: 4.8,
      baseRate: 35,
      ratePerKm: 2.0,
      availability: "Available",
      fleetSize: 18,
      vehicleTypes: ["Tesla Model 3", "Tesla Model X"],
      image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800",
      features: ["Zero Emission", "Silent Drive", "Tech Enabled"]
    }
  ];

  const bookings: any[] = [];

  // API Routes
  app.get("/api/fleets", (req, res) => {
    res.json(fleets);
  });

  app.post("/api/bookings", (req, res) => {
    const booking = {
      id: `book-${Date.now()}`,
      status: "pending",
      createdAt: new Date().toISOString(),
      ...req.body
    };
    bookings.push(booking);
    res.status(201).json(booking);
  });

  app.get("/api/bookings", (req, res) => {
    res.json(bookings);
  });

  app.post("/api/ai/compare", async (req, res) => {
    const { requirement } = req.body;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Compare these transport fleets for a business user with these requirements: "${requirement}". 
        Fleets: ${JSON.stringify(fleets)}. 
        Provide a concise recommendation for the best fleet and why in 3 bullet points. 
        Format as JSON with "recommendation" string and "bestFleetId" field.`,
        config: {
          responseMimeType: "application/json"
        }
      });
      res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to generate comparison" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
