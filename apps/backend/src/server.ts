import "dotenv/config";

import cors from "cors";
import express from "express";
import helmet from "helmet";

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "DayWiggle API is running",
  });
});

app.listen(port, () => {
  console.log(`DayWiggle API running at http://localhost:${port}`);
});