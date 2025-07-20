const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { z } = require("zod");

const { getTransactions } = require("./services/Transactions");
const { getBalance } = require("./services/Balance");

const server = new McpServer({
    name: "financial-tracker-server",
    version: "1.0.0" // should this match the api server version?
});

server.registerTool(
    "echo",
    {
        title: "Echo Tool",
        description: "Echoes back the provided message",
        inputSchema: { message: z.string() }
    },
    async ({ message }) => ({
        content: [{ type: "text", text: `Tool echo: ${message}` }]
    })
);

// TODO: write tests?
server.registerTool(
    "transactions",
    {
        title: "Get Transactions",
        description: "Returns all the user's transactions",
    },
    async () => ({
        content: [{ type: "text", text: JSON.stringify(await getTransactions(), null, 4) }]
    })
);

server.registerTool(
    "balance",
    {
        title: "Get Balances",
        description: "Returns balances of all a user's assets",
    },
    async () => ({
        content: [{ type: "text", text: JSON.stringify(await getBalance(), null, 4) }]
    })
);

module.exports.server = server;