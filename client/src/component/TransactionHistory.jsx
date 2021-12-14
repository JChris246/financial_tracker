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
        <section className="flex flex-col p-4 mx-4 bg-gray-200 border">
           <div className="text-3xl text-center uppercase">Transaction History</div>
           <div className="relative grid items-center h-full grid-flow-row py-10 mx-auto rounded-sm auto-rows-max sm:items-stretch sm:flex-row ">
                {
                    transactions.map((item, i) => <TransactionHistoryTile key={i} amount={item.amount} />)
                }

            </div>
        </section>
    );
}

export default TransactionHistory;