import "dotenv/config";

import path from "node:path";
import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import multer from "multer";

import "./db.js";
import { profileRouter } from "./profile.routes.js";

const app = express();

const port = Number(
  process.env.PORT ?? 4000
);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(
  cors({
    origin: true,
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  "/uploads",
  express.static(
    path.resolve("uploads")
  )
);

app.get(
  "/api/health",
  (
    _request: Request,
    response: Response
  ) => {
    response.status(200).json({
      success: true,
      message:
        "DayWiggle backend is running.",
    });
  }
);

app.use(
  "/api/profile",
  profileRouter
);

app.use(
  (
    _request: Request,
    response: Response
  ) => {
    response.status(404).json({
      success: false,
      message: "Route not found.",
    });
  }
);

app.use(
  (
    error: Error,
    _request: Request,
    response: Response,
    _next: NextFunction
  ) => {
    console.error(
      "Backend error:",
      error
    );

    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        response.status(400).json({
          success: false,
          message:
            "Profile picture must be smaller than 5 MB.",
        });

        return;
      }

      response.status(400).json({
        success: false,
        message: error.message,
      });

      return;
    }

    response.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal server error.",
    });
  }
);

app.listen(
  port,
  "0.0.0.0",
  () => {
    console.log(
      `DayWiggle backend running at http://localhost:${port}`
    );
  }
);