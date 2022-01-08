var express = require("express");
var router = express.Router();
var controller = require("../controllers/Transactions");

router
    .get("/:type?", controller.getTransactions)
    .post("/", controller.addTransaction)
    .get("/all/graph", controller.getGraphData);

module.exports = router;