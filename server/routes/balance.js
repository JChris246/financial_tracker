var express = require("express");
var router = express.Router();
var controller = require("../controllers/Balance");

router
    .get("/", controller.getBalance)
    .get("/all", controller.getAllBalances);

module.exports = router;