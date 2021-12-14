import React from "react";

import TransactionHistoryTile from "./TransactionHistoryTile";

const transactions = [
    {
        amount: 45
    }, {
        amount: -45
    }, {
        amount: -5
    }, {
        amount: 5
    }, {
        amount: 9
    }, {
        amount: 0
    }
];

const TransactionHistory = () => {
    // const [transactions, setTransactions] = useState([]);

    // useEffect(() => {
    //     (async () => {
    //         const res = await fetch("/api/transactions", {
    //             method: "GET",
    //             headers: {
    //                 "Content-Type": "application/json"
    //             }
    //         });

    //         // if status comes back as an error
    //         // set transactions as an empty array for now
    //         if (res.status !== 200)
    //             setTransactions([]);
    //         else {
    //             // else get the transactions from the response json
    //             setTransactions(await res.json());
    //         }
    //     })();
    // }, []);

    return (
        <section className="flex flex-col p-4 bg-gray-100 mx-4 border">
           <div className="uppercase text-lg text-center">Transaction History</div>
           <div className="relative grid grid-flow-row auto-rows-max items-center h-full py-10 bg-white rounded-sm sm:items-stretch sm:flex-row mx-auto ">
                {
                    transactions.map((item, i) => <TransactionHistoryTile key={i} amount={item.amount} />)
                }

            </div>
        </section>
    );
}

export default TransactionHistory;