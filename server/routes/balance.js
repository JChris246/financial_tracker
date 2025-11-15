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
    })
    .get("/progress/:from/:to?", async (req, res) => {
        const { success, response, code, msg } = await service.getBalanceProgress(req.params.from, req.params.to);
        if (success) {
            res.status(200).send(response);
        } else {
            res.status(code).send({ msg });
        }
    })
    .get("/performance/:from/:to?", async (req, res) => {
        const { success, response, code, msg } = await service.getBalancePerformance(req.params.from, req.params.to);
        if (success) {
            res.status(200).send(response);
        } else {
            res.status(code).send({ msg });
        }
    });

module.exports = router;