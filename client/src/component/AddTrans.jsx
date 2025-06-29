import { useState, useEffect } from "react";
import { PlusIcon, XIcon } from "@heroicons/react/solid";

import { NotificationType, useNotificationContext } from "./Notification";
import { formatDate, DATE_TYPE } from "../utils/utils";
import { request } from "../utils/Fetch";
import { Modal } from "./Modal";

export const AddTrans = ({ refresh }) => {
    const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
    const [transaction, setTransaction] = useState({
        name: "",
        amount: "",
        date: formatDate(new Date(), DATE_TYPE.INPUT),
        category: "other",
        assetType: "cash",
        currency: "eur"
    });

    const [assetTypes, setAssetTypes] = useState([]);
    const [transactionCategories, setTransactionCategories] = useState([]);
    const [assetCurrencies, setAssetCurrencies] = useState({ cash: ["eur"], stock: [], crypto: [] });

    const getAvailableAssetTypes = () => {
        request({
            url: "/api/list/asset-type",
            callback: ({ msg, success, json }) => {
                if (success) {
                    setAssetTypes(json);
                    setTransaction({ ...transaction, assetType: json[0] });
                } else {
                    setAssetTypes(["cash", "stock", "crypto"]); // fallback on default
                    displayNotification({ message: "An error occurred fetching asset types: " + msg, type: NotificationType.Error });
                }
            }
        });
    };

    const getAvailableTransactionCategories = () => {
        request({
            url: "/api/list/category",
            callback: ({ msg, success, json }) => {
                if (success) {
                    setTransactionCategories(json);
                    setTransaction({ ...transaction, category: json[0] });
                } else {
                    setAssetTypes(["groceries", "other"]); // fallback on default
                    displayNotification({ message: "An error occurred fetching transaction categories: " + msg, type: NotificationType.Error });
                }
            }
        });
    };

    const getAvailableAssetCurrencies = () => {
        request({
            url: "/api/list/currency",
            callback: ({ msg, success, json }) => {
                if (success) {
                    setAssetCurrencies(json);
                    setTransaction({ ...transaction, currency: json[transaction.assetType][0] });
                } else {
                    displayNotification({ message: "An error occurred fetching asset currencies: " + msg, type: NotificationType.Error });
                }
            }
        });
    };

    useEffect(() => {
        getAvailableAssetTypes();
        getAvailableTransactionCategories();
        getAvailableAssetCurrencies();
    }, []);

    const { display: displayNotification } = useNotificationContext();

    const enterTransaction = (e) => {
        let newObject = { ...transaction, [e.target.name]: e.target.value };
        setTransaction(newObject);

        if (e.target.name === "assetType") {
            newObject = { ...newObject, currency: assetCurrencies[e.target.value][0] };
        }

        setTransaction(newObject);
    };

    const addTransaction = async (e) => {
        e.preventDefault();

        if (!transaction.name || !transaction.amount) {
            displayNotification({ message: "You need to have the transaction name and amount", type: NotificationType.Error });
            return;
        }

        const amount = Number(transaction.amount);
        if (isNaN(amount)) {
            displayNotification({ message: "You need to have a valid transaction amount", type: NotificationType.Error });
            return;
        }
        transaction.amount = amount;
        transaction.type = amount > 0;

        request({
            url: "/api/transaction",
            method: "POST",
            body: JSON.stringify(transaction),
            callback: ({ msg, success }) => {
                if (success) {
                    // clear input and close input
                    setTransaction({ name: "", amount: "", date: formatDate(new Date(), DATE_TYPE.INPUT) });
                    setIsAddTransactionModalOpen(false);
                    refresh();
                } else {
                    displayNotification({ message: "Unable to add transaction: " + msg, type: NotificationType.Error });
                }
            }
        });
    };

    const addTransactionTemplate = () => {
        return (
            <div className="relative flex flex-col w-full h-full rounded-none md:w-1/2 md:h-fit lg:max-w-[500px] bg-slate-900 border-1
                border-slate-800 md:rounded-lg shadow-lg outline-none focus:outline-none">

                <div className="flex items-end justify-between p-5 border-b-1 border-solid rounded-t border-slate-800">
                    <h3 className="text-3xl font-semibold">
                        Add Transaction
                    </h3>
                    <button
                        aria-label="Close Menu"
                        title="Close Menu"
                        className="object-right p-2 -mt-2 -mr-2 transition duration-200 rounded-full hover:bg-red-700 focus:bg-gray-700
                            focus:outline-none focus:shadow-outline hover:cursor-pointer"
                        onClick={() => setIsAddTransactionModalOpen(false)}
                    >
                        <XIcon className="w-5 text-slate-100 " />
                    </button>
                </div>

                <form className="relative flex-auto p-6" onSubmit={addTransaction}>
                    <div className="flex flex-col mt-0 space-y-2 sm:justify-center sm:-mx-2">
                        <input
                            type="text" value={transaction.name} onChange={enterTransaction} name="name" required id="transaction-name"
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md sm:mx-2 dark:bg-gray-800
                                dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500
                                focus:outline-none focus:ring"
                            placeholder="Transaction Name" />
                        <input type="number" value={transaction.amount} onChange={enterTransaction} name="amount" required
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md sm:mx-2 dark:bg-gray-800
                                dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500
                                focus:outline-none focus:ring"
                            placeholder="Transaction Amount" id="transaction-amount" />

                        <select value={transaction.category} onChange={enterTransaction} name="category" required title="category"
                            id="transaction-category"
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md sm:mx-2 dark:bg-gray-800
                                dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500
                                focus:outline-none focus:ring">
                            { transactionCategories.map((category) => (
                                <option key={category}>{category}</option>
                            ))}
                        </select>

                        <select value={transaction.assetType} onChange={enterTransaction} name="assetType" required title="asset type"
                            id="transaction-asset-type"
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md sm:mx-2 dark:bg-gray-800
                                dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500
                                focus:outline-none focus:ring">
                            { assetTypes.map((category) => (
                                <option key={category}>{category}</option>
                            ))}
                        </select>

                        <select value={transaction.currency} onChange={enterTransaction} name="currency" required title="currency"
                            id="transaction-currency"
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md sm:mx-2 dark:bg-gray-800
                                dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500
                                focus:outline-none focus:ring">
                            { assetCurrencies[transaction.assetType]?.map((category) => (
                                <option key={category}>{category}</option>
                            ))}
                        </select>

                        <input type="datetime-local" value={transaction.date} onChange={enterTransaction} name="date" required
                            title="transaction date"
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md sm:mx-2 dark:bg-gray-800
                                dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500
                                focus:outline-none focus:ring"
                            placeholder="Transaction Date" />

                        <button
                            className="px-4 py-2 text-sm font-bold tracking-wide text-white capitalize transition-colors duration-200
                                transform bg-blue-700 rounded-md sm:mx-2 hover:bg-blue-600 focus:outline-none focus:bg-blue-600 hover:cursor-pointer"
                            onClick={addTransaction} id="submit-transaction">
                            Add
                        </button>
                    </div>
                </form>

            </div>
        );
    };

    return (
        <section id="add-transaction" className="flex flex-col p-4">

            <button
                id="add-transaction-button"
                aria-label="Open Transaction Model"
                title="Open Transaction Model"
                className="inline-flex items-center justify-center h-12 font-medium text-gray-200 transition duration-200 bg-purple-700
                    rounded-full shadow-md hover:bg-purple-800 focus:shadow-outline focus:outline-none hover:cursor-pointer w-fit px-4"
                onClick={() => setIsAddTransactionModalOpen(true)}
            >
                <PlusIcon className="w-6 h-6 pr-1 text-gray-200" />
                Add Transaction
            </button>

            {isAddTransactionModalOpen && <Modal close={() => setIsAddTransactionModalOpen(false)}>
                { addTransactionTemplate() }
            </Modal> }

        </section>
    );
};