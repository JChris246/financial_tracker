const express = require("express");
const router = express.Router();
const service = require("../services/Calculator.js");

router
    .post("/compound-interest", (req, res) => {
        const { success, code, balance, profit, totalContrib, history, msg } = service.calculateCompound(req.body);
        if (success) {
            res.status(200).send({ balance, profit, totalContrib, history });
        } else {
            res.status(code).send({ msg });
        }
    })
    .post("/compound-stock", async (req, res) =>  {
        const { success, code, balance, profit, totalContrib, history, msg } = await service.calculateStockCompound(req.body);
        if (success) {
            res.status(200).send({ balance, profit, totalContrib, history });
        } else {
            res.status(code).send({ msg });
        }
    })

module.exports = router;