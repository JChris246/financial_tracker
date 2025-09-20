const express = require("express");
const router = express.Router();
const service = require("../services/Calculator.js");

router
    .post("/compound-interest", (req, res) => {
        const { success, code, balance, profit, totalContrib, initial, history, msg } = service.calculateCompound(req.body);
        if (success) {
            res.status(200).send({ balance, profit, totalContrib, initial, history });
        } else {
            res.status(code).send({ msg });
        }
    })
    .post("/compound-stock", async (req, res) =>  {
        const { success, code, balance, profit, totalContrib, history, initial, price, msg } = await service.calculateStockCompound(req.body);
        if (success) {
            res.status(200).send({ balance, profit, totalContrib, initial, price, history });
        } else {
            res.status(code).send({ msg });
        }
    })
    .post("/amortization", async (req, res) =>  {
        const { success, code, interestPaid, loanAmount, monthly, totalPaid, history, msg } = service.calculateAmortization(req.body);
        if (success) {
            res.status(200).send({ interestPaid, loanAmount, monthly, totalPaid, history });
        } else {
            res.status(code).send({ msg });
        }
    })

module.exports = router;