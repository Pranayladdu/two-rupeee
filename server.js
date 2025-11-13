
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import path from "path";
// import { fileURLToPath } from "url";
// import paymentRoutes from "./routes/paymentRoutes.js";
// import connectDB from "./db.js";

// dotenv.config(".env");
// const app = express();

// app.use(cors());
// app.use(express.json());
// connectDB();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);


// app.use(express.static(path.join(__dirname, "../client")));


// app.use("/api/payment", paymentRoutes);


// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "../client/index.html"));
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import paymentRoutes from "./routes/paymentRoutes.js";
import connectDB from "./db.js";

dotenv.config(); 
const app = express();

app.use(cors());
app.use(express.json());
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientCandidates = [
  path.join(__dirname, "client", "build"), 
  path.join(__dirname, "client", "dist"),  
  path.join(__dirname, "client")           
];

let clientRoot = null;
for (const p of clientCandidates) {
  if (fs.existsSync(p)) {
    clientRoot = p;
    break;
  }
}

if (clientRoot) {
  console.log("📦 Serving static client from:", clientRoot);
  app.use(express.static(clientRoot));

 
  app.get("/", (req, res, next) => {
    const indexFile = path.join(clientRoot, "index.html");
    if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
    if (req.path.startsWith("/api/")) return next();
    return res.status(404).send("Client index.html not found.");
  });
} else {
  
  app.get("/", (req, res) => res.status(200).send("API is running."));
}


app.use("/api/payment", paymentRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
