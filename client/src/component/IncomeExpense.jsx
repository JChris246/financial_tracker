import React, { useEffect, useState } from "react";

const getTransactions = async (type) => {
    const res = await fetch("/api/transactions/" + type, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    // if status comes back as an error
    // return as an empty array for now
    if (res.status !== 200)
        return [];
    else {
        // else get the transactions from the response json
        return await res.json();
    }
};

const IncomeExpense = ({ sync }) => {
    const [amount, setAmount] = useState({
        income: 0,
        expense: 0
    });

    useEffect(() => {
        (async () => {
            const income = (await getTransactions("income")).reduce((acc, cur) => acc + cur.amount, 0);
            const spend = (await getTransactions("spend")).reduce((acc, cur) => acc + cur.amount, 0);
            setAmount({
                income,
                expense: spend
            });
        })();
    }, [sync]);

    return (
        <section id="incomeexpense" className="flex flex-col p-4 mx-4 bg-gray-100 border">

            <div className="relative flex flex-col items-center h-full py-10 mx-auto bg-white rounded-sm sm:items-stretch sm:flex-row">
                <div className="px-12 py-8 md:w-72 ">
                    <h1 className="text-2xl font-bold text-gray-700">Income</h1>
                    <h6 className="text-4xl font-bold text-center text-green-400 sm:text-5xl">
                    $ {amount.income}
                    </h6>
                </div>
                <div className="w-56 h-1 transition duration-300 transform bg-gray-300 rounded-full group-hover:bg-deep-purple-accent-400 group-hover:scale-110 sm:h-auto sm:w-1" />
                <div className="px-12 py-8 md:w-72">
                    <h1 className="text-2xl font-bold text-gray-700">Expense</h1>
                    <h6 className="text-4xl font-bold text-center text-red-400 sm:text-5xl">
                    $ {amount.expense}
                    </h6>              
                </div>
            </div>
            
        </section>
    );
}

export default IncomeExpense;