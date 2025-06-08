import { useEffect, useState } from "react";

import TransactionHistoryTile from "./TransactionHistoryTile";
import { NotificationType, useNotificationContext } from "./Notification";
import { request } from "../utils/Fetch";

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
        <section id="history" className="flex flex-col p-4 mx-4 bg-gray-200 border">
            <div className="mt-2 text-2xl text-center uppercase">Transaction History</div>
            <div className="">
                <div className="relative grid items-center grid-flow-row py-10 mx-auto overflow-hidden rounded-sm
                    auto-rows-max sm:items-stretch sm:flex-row">
                    {
                        transactions.map((item, i) => <TransactionHistoryTile key={i} item={item} />)
                    }

                </div>
            </div>

        </section>
    );
}

export default TransactionHistory;