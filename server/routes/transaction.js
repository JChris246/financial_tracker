const express = require("express");
const router = express.Router();
const service = require("../services/Transactions");
const { isDefined } = require("../utils/utils");

router
    .get("/:type?", async (req, res) => {
        // TODO: update filtering logic
        const { success, transactions } = await service.getTransactions(req.params.type);

        if (success) {
            res.status(200).send(transactions);
        } else {
            res.status(500).send({ msg: "An error occurred fetching transactions" });
        }
    })
    .post("/:format?", async (req, res) => {
        const { format } = req.params;

        // formally "POST /"
        if (!isDefined(format)) {
            const { success, msg, code, transaction } = await service.addTransaction(req.body);

            if (success) {
                return res.status(201).send(transaction);
            } else {
                return res.status(code).send({ msg });
            }
        }

        // POST /csv
        if (format === "csv") {
            const { success, response } = service.processCSV(req.body);

            if (success) {
                return res.status(200).send(response);
            } else {
                return res.status(400).send(response);
            }
        }

        // POST /md
        if (format === "md") {
            const { success, response } = service.processMd(req.body);

            if (success) {
                return res.status(200).send(response);
            } else {
                return res.status(400).send(response);
            }
        }

        // POST /all OR POST /json
        if (format === "all" || format === "json") {
            const { success, addedTransactions, code, msg } = await service.addTransactions(req.body);
            if (success) {
                return res.status(201).send({ msg: "Transactions added successfully", addedTransactions });
            } else {
                return res.status(code).send({ msg });
            }
        }

        res.status(400).send({ msg: "Unsupported format: " + format });
    })
    .get("/export/:format", async (req, res) => {
        const { success, code, msg, response } = await service.exportTransactions(req.params);

        if (success) {
            res.status(200).send(response);
        } else {
            res.status(code).send({ msg });
        }
    })
    .delete("/:id", async (req, res) => {
        const { code, msg } = await service.deleteTransaction(req.params.id);

        res.status(code).send({ msg });
    })
    .put("/:id", async (req, res) => {
        const { code, msg, transaction } = await service.updateTransaction(req.params.id, req.body);

        res.status(code).send({ msg, transaction });
    })
    .get("/all/graph", async (_, res) => {
        const { success, msg, response } = await service.getGraphData();
        if (success) {
            res.status(200).send(response);
        } else {
            res.status(500).send({ msg });
        }
    });

module.exports = router;