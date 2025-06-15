var express = require("express");
var router = express.Router();
var controller = require("../controllers/List.js");

router
    .get("/currency/:assetType?", controller.getCurrencies)
    .get("/asset-type", controller.getAssetTypes)
    .get("/category", controller.getTransactionCategories);

module.exports = router;