const express = require("express");
const router = express.Router();

const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");

const logger = require("../logger").setup();

router
    .post("/", async (req, res) => {
        // In stateless mode, create a new instance of transport and server for each request
        // to ensure complete isolation. A single instance would cause request ID collisions
        // when multiple clients connect concurrently.
        try {
            const { server: mcpServer } = require("../mcp_server");
            const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
            res.on("close", () => {
                logger.debug("MCP request closed")
                transport.close();
                mcpServer.close();
            });
            await mcpServer.connect(transport);
            await transport.handleRequest(req, res, req.body);
        } catch (error) {
            logger.error("Error handling MCP request: ", error);
            if (!res.headersSent) {
                res.status(500).json({
                    jsonrpc: "2.0",
                    error: {
                        code: -32603,
                        message: "Internal server error",
                    },
                    id: null,
                });
            }
        }
    })
    // SSE notifications not supported in stateless mode
    .get("/", async (_, res) => {
        logger.debug("Received GET MCP request");
        res.writeHead(405).end(JSON.stringify({
            jsonrpc: "2.0",
            error: {
                code: -32000,
                message: "Method not allowed."
            },
            id: null
        }));
    })
    // Session termination not needed in stateless mode
    .delete("/", async (_, res) => {
        logger.debug("Received DELETE MCP request");
        res.writeHead(405).end(JSON.stringify({
            jsonrpc: "2.0",
            error: {
                code: -32000,
                message: "Method not allowed."
            },
            id: null
        }));
    });

module.exports = router;