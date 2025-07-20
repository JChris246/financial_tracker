const express = require("express");
const router = express.Router();
const service = require("../services/Price.js");

router
    .get("/:assetType/:currency?", async (req, res) => {
        const { success, msg, response } = await service.getCurrencyPrice(req.params);

        if (success) {
            res.status(200).send(response);
        } else {
            res.status(400).send({ msg });
        }
    });

module.exports = router;