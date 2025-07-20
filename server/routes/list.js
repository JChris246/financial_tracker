const express = require("express");
const router = express.Router();
const service = require("../services/List.js");

router
    .get("/currency/:assetType?", (req, res) => {
        const { success, currencies } = service.getCurrencies(req.params.assetType);
        if (success) {
            res.status(200).send(currencies);
        } else {
            res.status(400).send({ msg: "Invalid asset type" });
        }
    })
    .get("/asset-type", (_, res) => {
        const types = service.getAssetTypes();
        res.status(200).send(types);
    })
    .get("/category", async (_, res) => {
        const categories = await service.getTransactionCategories();
        res.status(200).send(categories);
    });

module.exports = router;