const addTransaction = async (superTestRequest, payload) => {
    // technically these should be direct entries to the db to test the balance endpoint in isolation, but should be good enough
    await superTestRequest.post("/api/transaction").send({
        name: "Test Transaction", date: "2022-01-01", amount: 0,
        assetType: "cash", currency: "usd", category: "Groceries",
        ...payload
    });
};

module.exports = {
    addTransaction
};