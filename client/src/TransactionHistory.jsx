import "./App.css";

import { useState, useEffect } from "react";
import { NavBar } from "./component/NavBar";

import { NotificationType, useNotificationContext } from "./component/Notification";
import { request } from "./utils/Fetch";
import { formatMoney, formatDate } from "./utils/utils";

function TransactionHistory() {
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState({ name: "", amount: "", date: "", category: "", assetType: "", currency: "" });
    const { display: displayNotification } = useNotificationContext();

    useEffect(() => {
        request({
            url: "/api/transactions",
            method: "GET",
            callback: ({ msg, success, json }) => {
                if (success) {
                    setTransactions(json);
                } else {
                    displayNotification({ message: "Unable to get transaction history: " + msg, type: NotificationType.Error });
                }
            }
        });
    }, []);

    const updateFilter = (e) => setFilter({ ...filter, [e.target.name]: e.target.value });

    const filterTransactions = transaction => {
        const straightMatchKeys = ["name", "amount", "category", "assetType", "currency"];
        for (let i = 0; i < straightMatchKeys.length; i++) {
            if (filter[straightMatchKeys[i]].trim() === "") {
                continue;
            }

            if (!String(transaction[straightMatchKeys[i]]).toLowerCase().includes(filter[straightMatchKeys[i]].toLowerCase())) {
                return false;
            }
        }

        if (filter.date.trim() === "") {
            return true;
        }

        return formatDate(transaction.date).includes(filter.date);
    };

    const sortTransactions = (a, b) => new Date(b.date) - new Date(a.date);

    // TODO: add a delete button per row
    const transactionHistoryTemplate = () => {
        return (
            <div className="overflow-y-scroll overflow-x-scroll w-full">
                <table className="text-left table-auto w-full text-lg border-2 border-slate-800">
                    <thead>
                        <tr className="bg-slate-800">
                            <th></th>
                            <th className="px-4 py-2 w-2/6">Name</th>
                            <th className="px-4 py-2 text-right w-1/6">Amount</th>
                            <th className="px-4 py-2">Date</th>
                            <th className="px-4 py-2 w-1/6">Category</th>
                            <th className="px-4 py-2">Asset Type</th>
                            <th className="px-4 py-2 text-right">Currency</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-1 border-slate-800">
                            <td></td>
                            <td className="px-4 py-2">
                                <input placeholder="Filter by name" value={filter.name} onChange={updateFilter} name="name" className="w-full"/>
                            </td>
                            <td className="px-4 py-2 text-right">
                                <input placeholder="Filter by amount" value={filter.amount}
                                    onChange={updateFilter} name="amount" className="w-full text-right"/>
                            </td>
                            <td className="px-2 py-2">
                                <input placeholder="Filter by date" value={filter.date} onChange={updateFilter} name="date" className="w-full"/>
                            </td>
                            <td className="px-4 py-2">
                                <input placeholder="Filter by category" value={filter.category} onChange={updateFilter}
                                    name="category" className="w-full"/>
                            </td>
                            <td className="px-2 py-2">
                                <input placeholder="Filter by asset type" value={filter.assetType} onChange={updateFilter} name="assetType"/>
                            </td>
                            <td className="px-4 py-2 text-right">
                                <input placeholder="Filter by currency" value={filter.currency} onChange={updateFilter}
                                    name="currency" className="text-right"/>
                            </td>
                        </tr>
                        { transactions
                            .filter(filterTransactions)
                            .sort(sortTransactions)
                            .map((transaction, i) => (
                                <tr key={i} className="hover:bg-slate-700">
                                    <td className="pl-4 text-gray-600 font-thin">{i+1}</td>
                                    <td className="px-4 py-2">{transaction.name}</td>
                                    <td id={"transaction-history-amount-" + i}
                                        className={"px-2 py-2 text-right " + (transaction.amount < 0 ? "text-red-400": "text-green-400")}>
                                        {/* add symbol */} {transaction.assetType === "cash" ? formatMoney(transaction.amount) : transaction.amount}
                                    </td>
                                    <td className="px-2 py-2 text-orange-300">{formatDate(transaction.date)}</td>
                                    <td className="px-4 py-2 text-sky-400">{transaction.category}</td>
                                    <td className="px-2 py-2">{transaction.assetType}</td>
                                    <td className="px-2 py-2 text-right">{transaction.currency}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="place-items-center bg-slate-900 min-h-screen text-gray-300 md:px-4 w-full">
            <NavBar/>

            {/* TODO: paginate? */}
            {/* TODO: make this table mobile friendly? */}
            {
                transactions.length > 0 ? transactionHistoryTemplate() :
                    <div className="w-full h-full flex flex-col items-center">
                        <span id="no-transactions-found" className="text-2xl font-bold text-gray-200">No transactions found.</span>
                    </div>
            }
        </div>
    );
}

export default TransactionHistory;
