const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { z } = require("zod");

const { getTransactions } = require("./services/Transactions");
const { getBalance } = require("./services/Balance");
const { calculateCompound, calculateStockCompound, calculateAmortization } = require("./services/Calculator");

const server = new McpServer({
    name: "financial-tracker-server",
    version: "1.0.0" // should this match the api server version?
});

// TODO: break this file up by tool groups?

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
    async () => {
        const { success, transactions } = await getTransactions();
        if (success) {
            return {
                content: [{ type: "text", text: JSON.stringify(transactions) }]
            }
        } else {
            return {
                content: [{ type: "text", text: "Unable to get transactions" }]
            }
        }
    }
);

server.registerTool(
    "balance",
    {
        title: "Get Balances",
        description: "Returns balances of all a user's assets",
    },
    async () => {
        const { success, response } = await getBalance();
        if (success) {
            return {
                content: [{ type: "text", text: JSON.stringify(response) }]
            }
        }
        else {
            return {
                content: [{ type: "text", text: "An error occurred while getting balances" }]
            }
        }
    }
);

// calculator tools

server.registerTool(
    "compound-interest-calculator",
    {
        title: "Calculate Compound Interest",
        description: `Calculates the amount you could earn over a period of time if your asset were increasing at a given rate.
            Basically this is a compound interest calculator. It will return the ending balance, total amount earned due to interest,
            total amount contributed over the period, the initial investment amount and an array showing a snapshot for each interval.

            Interest should be provided as a decimal (e.g. 0.35 for 35% and 0.0295 for 2.95%).
            Contribution is the amount that will be added to the balance at every interval during the total period.
            The total accumulation period should be provided as the number of months.
            The frequency of the intervals (during the total period) can be one of the following values: "monthly", "bi-monthly",
            "quarterly", "semi-annually", or "annually".
        `,
        inputSchema: {
            initialInvestment: z.number(),
            interest: z.number(),
            contribute: z.number(),
            months: z.number(),
            frequency: z.string()
        }
    },
    ({ initialInvestment, interest, contribute, months, frequency }) => {
        const { success, balance, profit, totalContrib, initial, history, msg } =
            calculateCompound({ initial: initialInvestment, interest, contribute, months, frequency });
        if (success) {
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({ balance, earned: profit, totalContributed: totalContrib, initialInvestment: initial, snapshots: history })
                }]
            }
        }
        else {
            return {
                content: [{ type: "text", text: "An error occurred calculating compound interest: " + msg }]
            }
        }
    }
);

server.registerTool(
    "stock-dividend-calculator",
    {
        title: "Calculate Stock Dividends",
        description: `Calculates the amount you could earn over a period of time of earning dividends from owning a given amount of shares
            in a stock asset. This is similar to a compound interest calculator but specifically for calculating compound earnings from
            stock dividends. It will return the ending balance, total amount earned due to dividend payments,
            total amount contributed over the period, the initial investment amount, the stock price used in the calculation and
            an array showing a snapshot for each interval.

            Dividend amount is the amount per share that is awarded at each interval.
            Initial investment is the amount in cash value of shares that is invested initially.
            The number shares can be provided as an alternative to the initial investment.
            If you provide the stock symbol, the calculator will try to get the price of the stock (fetching can fail if not supported).
            Alternatively you can provide the price of the stock manually (these are mutually exclusive so choose 1).
            Contribution is the amount (in cash to be invested) that will be added to the balance at every interval during the total period.
            The total accumulation period should be provided as the number of months.
            The frequency of the intervals (during the total period) can be one of the following values: "monthly", "bi-monthly",
            "quarterly", "semi-annually", or "annually".
        `,
        inputSchema: {
            initialInvestment: z.number().optional(),
            shares: z.number().optional(),
            symbol: z.string().optional(),
            price: z.number().optional(),
            divAmount: z.number(),
            contribute: z.number(),
            months: z.number(),
            frequency: z.string()
        }
    },
    async ({ initialInvestment, shares, symbol, price, divAmount, contribute, months, frequency }) => {
        const { success, balance, profit, totalContrib, initial, history, price: returnedPrice, msg } =
            await calculateStockCompound({ initial: initialInvestment, shares, symbol, price, divAmount, contribute, months, frequency });
        if (success) {
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        balance, earned: profit, totalContributed: totalContrib, initialInvestment: initial,
                        snapshots: history, stockPrice: returnedPrice
                    })
                }]
            }
        }
        else {
            return {
                content: [{ type: "text", text: "An error occurred calculating dividend accumulation: " + msg }]
            }
        }
    }
);

server.registerTool(
    "amortization-calculator",
    {
        title: "Amortization Calculator",
        description: `Used to determine the periodic payment amount due on a loan, based on the amortization process.
            It will return the calculated loan amount (price - deposit), the calculated monthly payment, the total amount paid
            after the entire process, the total interest paid after the entire process, and an array showing a snapshot for each interval (monthly).

            The price is the total cost of the thing being financed i.e. car, house etc.
            Down is the deposit payed down.
            Months is the total duration of the payback period.
            Interest is the amount being charged on an annual basis, this should be provided as a decimal (e.g. 0.35 for 35% and 0.0295 for 2.95%).
        `,
        inputSchema: {
            price: z.number(),
            down: z.number(),
            months: z.number(),
            interest: z.number()
        }
    },
    async ({ price, down, months, interest }) => {
        const { success, interestPaid, loanAmount, monthly, totalPaid, history, msg } = calculateAmortization({ price, down, months, interest });
        if (success) {
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({ interestPaid, loanAmount, monthly, totalPaid, history })
                }]
            }
        }
        else {
            return {
                content: [{ type: "text", text: "An error occurred calculating amortization schedule: " + msg }]
            }
        }
    }
);

module.exports.server = server;