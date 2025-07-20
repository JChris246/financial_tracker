const express = require("express");
const router = express.Router();
const service = require("../services/List.js");

router
    .get("/currency/:assetType?", service.getCurrencies)
    .get("/asset-type", service.getAssetTypes)
    .get("/category", service.getTransactionCategories);

module.exports = router;