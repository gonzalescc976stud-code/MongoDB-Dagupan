// =========================
// IMPORT MONGOOSE
// =========================
const mongoose = require("mongoose");

// =========================
// CONNECT TO MONGODB
// =========================
mongoose.connect("mongodb://127.0.0.1:27017/aggregationDemoDB")
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log("Connection Error:", err);
  });

// =========================
// CREATE SALES SCHEMA
// =========================
const salesSchema = new mongoose.Schema({
  productName: String,
  category: String,
  price: Number,
  quantity: Number
});

// =========================
// CREATE MODEL
// =========================
const Sale = mongoose.model("Sale", salesSchema);

// =========================
// INSERT SAMPLE DATA
// =========================
async function insertSampleData() {

  await Sale.deleteMany();

  await Sale.insertMany([
    {
      productName: "Laptop",
      category: "Electronics",
      price: 50000,
      quantity: 2
    },
    {
      productName: "Mouse",
      category: "Electronics",
      price: 1000,
      quantity: 5
    },
    {
      productName: "Keyboard",
      category: "Electronics",
      price: 2500,
      quantity: 3
    },
    {
      productName: "Chair",
      category: "Furniture",
      price: 3000,
      quantity: 4
    },
    {
      productName: "Table",
      category: "Furniture",
      price: 7000,
      quantity: 2
    }
  ]);

  console.log("Sample data inserted");
}

// =========================
// AGGREGATION PIPELINE
// =========================
async function runAggregation() {

  const results = await Sale.aggregate([

    // =========================
    // MATCH STAGE
    // Filter Electronics category
    // =========================
    {
      $match: {
        category: "Electronics"
      }
    },

    // =========================
    // GROUP STAGE
    // Group by category
    // =========================
    {
      $group: {
        _id: "$category",

        totalProducts: {
          $sum: 1
        },

        totalRevenue: {
          $sum: {
            $multiply: ["$price", "$quantity"]
          }
        }
      }
    },

    // =========================
    // PROJECT STAGE
    // Restructure output
    // =========================
    {
      $project: {
        _id: 0,
        category: "$_id",
        totalProducts: 1,
        totalRevenue: 1
      }
    },

    // =========================
    // SORT STAGE
    // Sort descending
    // =========================
    {
      $sort: {
        totalRevenue: -1
      }
    }

  ]);

  console.log("Aggregation Results:");
  console.log(results);

  mongoose.connection.close();
}

// =========================
// RUN APPLICATION
// =========================
async function startApp() {

  await insertSampleData();

  await runAggregation();

}

startApp();