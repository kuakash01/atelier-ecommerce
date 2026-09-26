const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('../../server/config/connection.db');
const routes = require('../../server/routes/index');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount routes for both /api prefix and root prefix
app.use('/api', routes);
app.use('/', routes);

// Error handler
app.use((err, req, res, next) => {
  console.error("API Error:", err);
  res.status(err.status || 500).json({
    status: "failed",
    message: err.message || "Internal Server Error",
  });
});

export const config = {
  api: {
    bodyParser: false, // Let Express and Multer handle streams and body parsing
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error("Database connection failed in API handler:", err);
  }

  return new Promise((resolve, reject) => {
    app(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      resolve(result);
    });
  });
}
