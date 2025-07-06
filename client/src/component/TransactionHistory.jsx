import { useEffect, useState } from "react";

import TransactionHistoryTile from "./TransactionHistoryTile";
import { NotificationType, useNotificationContext } from "./Notification";
import { request } from "../utils/Fetch";

const MAX_TRANSACTION_ITEMS = 5;

const TransactionHistory = ({ sync }) => {
    const [transactions, setTransactions] = useState([]);

    const { display: displayNotification } = useNotificationContext();

    useEffect(() => {
        request({
            url: "/api/transactions",
            method: "GET",
            callback: ({ msg, success, json }) => {
                if (success) {
                    // get the transactions from the response json
                    setTransactions(json);
                } else {
                    // if status comes back as an error
                    // set transactions as an empty array for now
                    setTransactions([]);
                    displayNotification({ message: "Unable to get transactions to show history: " + msg, type: NotificationType.Error });
                }
            }
        });
    }, [sync]);

    return (
        <section id="history" className="flex flex-col p-4 mx-4 bg-gray-800 rounded-md w-full md:w-fit my-4 md:my-2 h-fit lg:h-1/3">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-4">
                <div className="mt-2 text-stone-200 text-2xl font-semibold capitalize mb-2 lg:mb-0">Transaction History</div>
                <a href="" className="font-semibold text-sky-400 hover:text-sky-600">View all</a>
            </div>
            <div id="transaction-history-list">{
                transactions
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, MAX_TRANSACTION_ITEMS)
                    .map((item, i) => <TransactionHistoryTile key={i} item={item} index={i} />)
            }</div>
        </section>
    );
};

export default TransactionHistory;