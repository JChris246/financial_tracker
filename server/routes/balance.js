const express = require("express");
const router = express.Router();
const service = require("../services/Balance");

router
    .get("/", async (_, res) => {
        const { success, response } = await service.getBalance();
        if (success) {
            res.status(200).send(response);
        } else {
            res.status(500).send({ msg: "An error occurred while getting balance" });
        }
    });

module.exports = router;