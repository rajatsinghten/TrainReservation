const express = require("express");
const router = express.Router();
const { findTrains } = require("../controllers/findTrains");


const app = express();

// Middleware to parse JSON
app.use(express.json());



router.get('/trains', findTrains)

module.exports = router