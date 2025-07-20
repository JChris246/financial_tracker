const express = require("express");
const router = express.Router();
const service = require("../services/Price.js");

router
    .get("/:assetType/:currency?", service.getCurrencyPrice)

module.exports = router;