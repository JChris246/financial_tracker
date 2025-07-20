const express = require("express");
const router = express.Router();
const service = require("../services/Transactions");

router
    .get("/:type?", service.getTransactions) // TODO: update filtering logic
    .post("/", service.addTransaction)
    .post("/all", service.addTransactions)
    .post("/csv", service.processCSV)
    .post("/md", service.processMd)
    .get("/export/:format", service.exportTransactions)
    .get("/all/graph", service.getGraphData);

// routes POST /, POST /md and POST /csv could probably be consolidated to POST /:format?

module.exports = router;