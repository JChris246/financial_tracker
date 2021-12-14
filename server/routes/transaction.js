var express = require("express");
var router = express.Router();
var controller = require("../controllers/Transactions");

router
    .get("/:id", controller.getTransaction)
    .get("/", controller.getTransactions);

module.exports = router;