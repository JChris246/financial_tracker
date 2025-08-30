import "./App.css";

import { useState, useEffect } from "react";
import { XIcon } from "@heroicons/react/solid";

import { NavBar } from "./component/NavBar";
import { Modal } from "./component/Modal";

import { NotificationType, useNotificationContext } from "./component/Notification";
import { request } from "./utils/Fetch";
import { formatMoney, formatDate } from "./utils/utils";

function TransactionHistory() {
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
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

    const clickDelete = id => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
    };

    const deleteTransaction = () => {
        request({
            url: "/api/transactions/" + deleteId,
            method: "DELETE",
            callback: ({ msg, success }) => {
                if (success) {
                    setTransactions(transactions.filter(t => t.id !== deleteId));
                    displayNotification({ message: "Transaction successfully deleted", type: NotificationType.Success });
                } else {
                    displayNotification({ message: "An error occurred deleting the transaction: " + msg, type: NotificationType.Error });
                }
                closeDeleteModal();
            }
        });
    };

    const deleteConfirmTemplate = () => {
        const transaction = transactions.filter(t => t.id === deleteId)[0];
        return (
            <div id="deleteTransactionModal" className="flex flex-col w-full h-full rounded-none md:w-fit md:h-fit bg-slate-900 border-1
                border-slate-800 md:rounded-lg shadow-lg outline-none focus:outline-none">
                <div className="flex items-end justify-between p-5 border-b-1 border-solid rounded-t border-slate-800">
                    <h4 className="text-2xl font-semibold md:mr-4">Are you sure you want to delete this transaction?</h4>
                    <button aria-label="Close Menu" title="Close Menu" onClick={closeDeleteModal}
                        className="object-right p-2 -mt-2 -mr-2 transition duration-200 rounded-full hover:bg-red-700 focus:bg-gray-700
                            focus:outline-none focus:shadow-outline hover:cursor-pointer">
                        <XIcon className="w-4 text-slate-100"/>
                    </button>
                </div>

                <div className="flex flex-col my-4 text-lg px-4">
                    <table className="text-left table-auto w-full text-lg mt-4 mb-6">
                        <tbody>
                            <tr>
                                <td className="px-4 py-2">{transaction.name}</td>
                                <td className={"px-2 py-2 text-right " + (transaction.amount < 0 ? "text-red-400": "text-green-400")}>
                                    {/* add symbol */} {transaction.assetType === "cash" ? formatMoney(transaction.amount) : transaction.amount}
                                </td>
                                <td className="px-2 py-2 text-orange-300">{formatDate(transaction.date)}</td>
                                <td className="px-4 py-2 text-sky-400">{transaction.category}</td>
                                <td className="px-2 py-2">{transaction.assetType}</td>
                                <td className="px-2 py-2 text-right">{transaction.currency}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="px-2 space-x-2">
                        <button onClick={deleteTransaction} id="confirm-delete-transaction"
                            className="bg-red-700 hover:bg-red-800 text-gray-200 px-4 py-2 rounded-md font-bold cursor-pointer">
                            Yes, delete
                        </button>
                        <button onClick={closeDeleteModal} id="cancel-delete-transaction"
                            className="text-gray-200 hover:bg-slate-700 px-4 py-2 rounded-md font-bold border-1 border-gray-200 cursor-pointer">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const createExport = e => {
        const { name } = e.target;

        const download = (type, content) => {
            // Create a blob
            var blob = new Blob([content], { type: "text/" + type + ";charset=utf-8" });
            var url = URL.createObjectURL(blob);

            // Create a link to download it
            var link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "transactions." + type);
            link.click();
        };

        request({
            url: "/api/transactions/export/" + name,
            method: "GET",
            callback: ({ msg, success, json }) => {
                if (success) {
                    download(name, json[name] ?? JSON.stringify(json));
                    setTimeout(() => setIsExportModalOpen(false), 500);
                } else {
                    displayNotification({ message: "An error occurred trying to export transactions: " + msg, type: NotificationType.Error });
                }
            }
        });
    };

    const exportModalTemplate = () => {
        return (
            <div className="flex flex-col w-full h-full rounded-none md:w-fit md:h-fit bg-slate-900 border-1
                border-slate-800 md:rounded-lg shadow-lg outline-none focus:outline-none">
                <div className="flex items-end justify-between p-5 border-b-1 border-solid rounded-t border-slate-800">
                    <h4 className="text-2xl font-semibold md:mr-4">Export Transactions</h4>
                    <button aria-label="Close Menu" title="Close Menu" onClick={() => setIsExportModalOpen(false)}
                        className="object-right p-2 -mt-2 -mr-2 transition duration-200 rounded-full hover:bg-red-700 focus:bg-gray-700
                            focus:outline-none focus:shadow-outline hover:cursor-pointer">
                        <XIcon className="w-4 text-slate-100"/>
                    </button>
                </div>

                <div className="flex flex-col items-center space-y-2 my-4 text-lg px-2 md:px-0">
                    <button className="rounded-lg px-4 py-2 bg-sky-600 hover:bg-sky-700 flex w-full md:w-fit cursor-pointer"
                        name="csv" onClick={createExport}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                            stroke="currentColor" className="size-6 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375
                                19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0
                                12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.622-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1
                                12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504
                                1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125
                                1.125M3.376 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621
                                0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5
                                0c-.621 0-1.125.504-1.126 1.125v1.5c0 .621.504 1.125 1.126 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125
                                1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621
                                0-1.125.504-1.125 1.125M20.625 12c.622 0 1.125.502 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12
                                14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125
                                1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" />
                        </svg>
                        Export as csv
                    </button>
                    <button className="rounded-lg px-4 py-2 bg-sky-600 hover:bg-sky-700 flex w-full md:w-fit cursor-pointer"
                        name="md" onClick={createExport}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                            stroke="currentColor" className="size-6 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.374 0 0 0-3.375-3.375h-1.5A1.125 1.125
                                0 0 1 13.6 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.4 3H12M10.5 2.25H5.625c-.620
                                0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.124 1.125h12.75c.621 0 1.125-.502 1.125-1.125V11.25a9
                                9 0 0 0-9-9Z" />
                        </svg>
                        Export as md
                    </button>
                    <button className="rounded-lg px-4 py-2 bg-sky-600 hover:bg-sky-700 flex w-full md:w-fit cursor-pointer"
                        name="json" onClick={createExport}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                            stroke="currentColor" className="size-6 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.24 6.75 22.5 12l-5.26 5.25m-10.5 0L1.5
                                12l5.25-5.25m7.5-3-4.4 16.4" />
                        </svg>
                        Export as json
                    </button>
                </div>
            </div>
        );
    };

    const transactionHistoryTemplate = () => {
        return (
            <div className="overflow-y-scroll overflow-x-scroll w-full">
                <table className="text-left table-auto w-full text-lg border-2 border-slate-800 mb-2">
                    <thead>
                        <tr className="bg-slate-800">
                            <th></th>
                            <th className="px-4 py-2 w-2/6">Name</th>
                            <th className="px-4 py-2 text-right w-1/6">Amount</th>
                            <th className="px-4 py-2 w-1/8">Date</th>
                            <th className="px-4 py-2 w-1/6">Category</th>
                            <th className="px-4 py-2">Asset Type</th>
                            <th className="px-4 py-2 text-right">Currency</th>
                            <th></th>
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
                            <td></td>
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
                                    <td className="px-2">
                                        <button className="cursor-pointer" onClick={() => clickDelete(transaction.id)} name="delete-transaction">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                                className="size-6 stroke-red-400 hover:stroke-red-600">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26
                                                    9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244
                                                    2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12
                                                    .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5
                                                    0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09
                                                    1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </button>
                                    </td>
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

            <div className="w-full flex p-4">
                <button onClick={() => setIsExportModalOpen(true)} id="export-btn"
                    className="ml-auto px-4 py-2 bg-purple-700 rounded-lg shadow-md hover:bg-purple-800 cursor-pointer flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                        stroke="currentColor" className="size-6 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M3 16.5v2.25A2.24 2.25 0 0 0 5.24 21h13.5A2.25 2.25 0 0 0 22 18.75V16.5M16.4 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Export
                </button>
            </div>
            {/* TODO: paginate? */}
            {/* TODO: make this table mobile friendly? */}
            {
                transactions.length > 0 ? transactionHistoryTemplate() :
                    <div className="w-full h-full flex flex-col items-center">
                        <span id="no-transactions-found" className="text-2xl font-bold text-gray-200">No transactions found.</span>
                    </div>
            }

            {isExportModalOpen && <Modal close={() => setIsExportModalOpen(false)}>
                { exportModalTemplate() }
            </Modal> }

            {isDeleteModalOpen && <Modal close={closeDeleteModal}>
                { deleteConfirmTemplate() }
            </Modal> }
        </div>
    );
}

export default TransactionHistory;
