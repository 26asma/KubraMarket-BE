
const express = require("express");
const cors = require("cors");
const { Sequelize } = require("sequelize");
require("dotenv").config();
const cron =require("node-cron")
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const merchantRoutes = require("./routes/merchantRoutes");
const rentRoutes = require("./routes/rentRoutes")
const merchantRequestRoutes = require("./routes/merchantRequestRoutes");
const shopRoutes = require("./routes/shopRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const productRoutes = require("./routes/productRoutes");
const variantRoutes = require("./routes/variantRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const cartRoutes = require("./routes/cartRoutes");
const errorHandler = require('./middlewares/errorHandler');
require('./jobs/generateMonthlyRent')();
require('./jobs/markLateRent')();


const app = express();
const corsOptions = {
  origin: ['http://localhost:5173','http://127.0.0.1:5500'], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/merchant", merchantRoutes);
app.use('/api/merchant-requests',merchantRequestRoutes);
app.use('/api/rent',rentRoutes)
app.use("/api/category", categoryRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/product", productRoutes);
app.use("/api/product/variant", variantRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);

app.use(errorHandler);

// Initialize Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

// Start server only if DB is connected
(async () => {
  try {
    console.log("⏳ Trying to connect to the database...");

    await sequelize.authenticate();
    console.log("✅ Database connection established");

    const PORT = process.env.PORT || 5000;
    app.get("/", (req, res) => {
  res.send(`
    <html>
      <head><title>Kubra Market</title></head>
      <body style="font-family: sans-serif; text-align: center; width:100vw;display: flex; justify-content: center; align-items: center; height: 100vh;overflow: hidden;">
        <h1 style="color:rgb(118, 73, 122);">KubraMarket Development Server is Live!</h1>
       
      </body>
    </html>
  `);
});

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);
    process.exit(1); // Stop the app if DB fails
  }
})();
