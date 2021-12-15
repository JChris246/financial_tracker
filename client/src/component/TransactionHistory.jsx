import React from "react";

import TransactionHistoryTile from "./TransactionHistoryTile";

const transactions = [
    {
        amount: 45,
        name: "cash"
    }, {
        amount: -45,
        name: "book"
    }, {
        amount: -5,
        name: "chewing Gum"
    }, {
        amount: 5,
        name: "cash"
    }, {
        amount: 9,
        name: "cash"
    }, {
        amount: 0,
        name: "test"
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
        <section id="history" className="flex flex-col p-4 mx-4 bg-gray-200 border">
           <div className="mt-2 text-2xl text-center uppercase">Transaction History</div>
           <div className="">
               <div className="relative grid items-center grid-flow-row py-10 mx-auto overflow-hidden rounded-sm auto-rows-max sm:items-stretch sm:flex-row">
                {
                    transactions.map((item, i) => <TransactionHistoryTile key={i} item={item} />)
                }

            </div>
           </div>
           
        </section>
    );
}

export default TransactionHistory;