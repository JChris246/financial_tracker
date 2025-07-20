const express = require("express");
const router = express.Router();
const service = require("../services/Balance");

router
    .get("/", service.getBalance);

module.exports = router;