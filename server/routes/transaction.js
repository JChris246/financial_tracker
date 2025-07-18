var express = require("express");
var router = express.Router();
var controller = require("../controllers/Transactions");

router
    .get("/:type?", controller.getTransactions) // TODO: update filtering logic
    .post("/", controller.addTransaction)
    .post("/all", controller.addTransactions)
    .post("/csv", controller.processCSV)
    .post("/md", controller.processMd)
    .get("/export/:format", controller.exportTransactions)
    .get("/all/graph", controller.getGraphData);

// routes POST /, POST /md and POST /csv could probably be consolidated to POST /:format?

module.exports = router;