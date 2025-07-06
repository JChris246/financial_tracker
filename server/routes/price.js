var express = require("express");
var router = express.Router();
var controller = require("../controllers/Price.js");

router
    .get("/:assetType/:currency?", controller.getCurrencyPrice)

module.exports = router;