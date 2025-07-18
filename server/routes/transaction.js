var express = require("express");
var router = express.Router();
var controller = require("../controllers/Transactions");

router
    .get("/:type?", controller.getTransactions) // TODO: update filtering logic
    .post("/", controller.addTransaction)
    .post("/all", controller.addTransactions)
    .post("/csv", controller.processCSV)
    .get("/export/:format", controller.exportTransactions)
    .get("/all/graph", controller.getGraphData);

module.exports = router;