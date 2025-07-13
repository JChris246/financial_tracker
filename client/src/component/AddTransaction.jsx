import { useState, useEffect, useRef } from "react";
import { PlusIcon, XIcon } from "@heroicons/react/solid";

import { NotificationType, useNotificationContext } from "./Notification";
import { formatDate, DATE_TYPE } from "../utils/utils";
import { request } from "../utils/Fetch";
import { Modal } from "./Modal";

export const AddTransaction = ({ refresh }) => {
    const csvInput = useRef();
    const [csvData, setCSVData] = useState({ transactions: [], invalid: {} });
    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);

    const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
    const [isCategoryFreeText, setIsCategoryFreeText] = useState(false);
    const [transaction, setTransaction] = useState({
        name: "",
        amount: "",
        date: formatDate(new Date(), DATE_TYPE.INPUT),
        category: "other",
        assetType: "cash",
        currency: "aed"
    });

    const [assetTypes, setAssetTypes] = useState([]);
    const [transactionCategories, setTransactionCategories] = useState([]);
    const [assetCurrencies, setAssetCurrencies] = useState({ cash: ["aed"], stock: [], crypto: [] });

    const { display: displayNotification } = useNotificationContext();

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
                    setTransactionCategories(["add custom", ...json]);
                    setTransaction({ ...transaction, category: json[0] });
                } else {
                    setTransactionCategories(["groceries", "other"]); // fallback on default
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

    const selectFile = async e => {
        const { target: { files } } = e;
        console.log({ files });

        request({
            url: "/api/transaction/csv",
            method: "POST",
            body: JSON.stringify({ csv: await files[0].text() }),
            callback: ({ json, status }) => {
                if (status !== 500) {
                    const { transactions, invalid } = json;
                    setCSVData({ transactions, invalid });
                    setIsCSVModalOpen(true);
                } else {
                    displayNotification({ message: "An error occurred processing the CSV file", type: NotificationType.Error });
                }
            }
        });
    };

    const enterTransaction = (e) => {
        let newObject = { ...transaction, [e.target.name]: e.target.value };

        if (e.target.name === "assetType") {
            newObject = { ...newObject, currency: assetCurrencies[e.target.value][0] };
        }

        if (e.target.name === "category" && !isCategoryFreeText) {
            if (e.target.value === "add custom") {
                setIsCategoryFreeText(true);
                newObject = { ...newObject, category: "" };
            }
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
                    closeAddTransactionModal();
                    refresh();
                } else {
                    displayNotification({ message: "Unable to add transaction: " + msg, type: NotificationType.Error });
                }
            }
        });
    };

    const submitTransactions = async (e) => {
        e.preventDefault();

        request({
            url: "/api/transaction/all",
            method: "POST",
            body: JSON.stringify(csvData.transactions),
            callback: ({ msg, success }) => {
                if (success) {
                    closeReviewCsvModal();
                    refresh();
                } else {
                    displayNotification({ message: "Unable to add transactions: " + msg, type: NotificationType.Error });
                }
            }
        });
    };

    const updateCsvTransaction = (e, row) => {
        e.preventDefault();

        let newObject =  [...csvData.transactions];
        newObject[row] = { ...newObject[row], [e.target.name]: e.target.value };
        if (e.target.name === "assetType") {
            newObject[row] = { ...newObject[row], currency: assetCurrencies[e.target.value][0] };
        }

        setCSVData({ ...csvData, transactions: newObject, invalid: { ...csvData.invalid, [row]: undefined } });
    };

    const categoryInputTemplate = () => {
        return isCategoryFreeText ?
            <input
                type="text" value={transaction.category} onChange={enterTransaction} name="category" required title="category"
                id="transaction-category" className="px-4 py-2 border rounded-md sm:mx-2 bg-gray-800 text-gray-300 border-gray-600
                    focus:border-blue-500 focus:outline-none focus:ring"
                placeholder="Enter a custom transaction category" />
            : <select value={transaction.category} onChange={enterTransaction} name="category" required title="category"
                id="transaction-category"
                className="px-4 py-2 border rounded-md sm:mx-2 bg-gray-800 text-gray-300 border-gray-600 focus:border-blue-500
                    focus:outline-none focus:ring">
                { transactionCategories.map((category) => (
                    <option key={category}>{category}</option>
                ))}
            </select>;
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
                        onClick={closeAddTransactionModal}
                    >
                        <XIcon className="w-5 text-slate-100 " />
                    </button>
                </div>

                <form className="relative flex-auto p-6" onSubmit={addTransaction}>
                    <div className="flex flex-col mt-0 space-y-2 sm:justify-center sm:-mx-2">
                        <input
                            type="text" value={transaction.name} onChange={enterTransaction} name="name" required id="transaction-name"
                            className="px-4 py-2 border rounded-md sm:mx-2 bg-gray-800 text-gray-300 border-gray-600
                                focus:border-blue-500 focus:outline-none focus:ring"
                            placeholder="Transaction Name" />
                        <input type="number" value={transaction.amount} onChange={enterTransaction} name="amount" required
                            className="px-4 py-2 border rounded-md sm:mx-2 bg-gray-800 text-gray-300 border-gray-600
                                focus:border-blue-500 focus:outline-none focus:ring"
                            placeholder="Transaction Amount" id="transaction-amount" />

                        { categoryInputTemplate() }

                        <select value={transaction.assetType} onChange={enterTransaction} name="assetType" required title="asset type"
                            id="transaction-asset-type"
                            className="px-4 py-2 border rounded-md sm:mx-2 bg-gray-800 text-gray-300 border-gray-600 focus:border-blue-500
                                focus:outline-none focus:ring">
                            { assetTypes.map((assetType) => (
                                <option key={assetType}>{assetType}</option>
                            ))}
                        </select>

                        <select value={transaction.currency} onChange={enterTransaction} name="currency" required title="currency"
                            id="transaction-currency"
                            className="px-4 py-2 border rounded-md sm:mx-2 bg-gray-800 text-gray-300 border-gray-600 focus:border-blue-500
                                focus:outline-none focus:ring">
                            { assetCurrencies[transaction.assetType]?.map((currency) => (
                                <option key={currency}>{currency}</option>
                            ))}
                        </select>

                        <input type="datetime-local" value={transaction.date} onChange={enterTransaction} name="date" required
                            title="transaction date" id="transaction-date"
                            className="px-4 py-2 border rounded-md sm:mx-2 bg-gray-800 text-gray-300 border-gray-600
                                focus:border-blue-500 focus:outline-none focus:ring"
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

    const closeAddTransactionModal = () => {
        setIsAddTransactionModalOpen(false);
        setIsCategoryFreeText(false);
        setTransaction({
            name: "", amount: "", date: formatDate(new Date(), DATE_TYPE.INPUT), category: "other", assetType: "cash", currency: "aed"
        });
    };

    const reviewCsvTemplate = () => {
        return (
            <div id="review-csv-modal" className="flex flex-col w-full h-full rounded-none lg:w-2/3 xl:w-fit md:h-fit bg-slate-900 border-2
                border-slate-800 md:rounded-lg shadow-lg outline-none focus:outline-none">
                <div className="flex items-end justify-between p-5 border-b-1 border-solid rounded-t border-slate-800 mb-2">
                    <h3 className="text-3xl font-semibold">Review Transactions</h3>
                    <button aria-label="Close Menu" title="Close Menu" onClick={closeReviewCsvModal}
                        className="object-right p-2 -mt-2 -mr-2 transition duration-200 rounded-full hover:bg-red-700 focus:bg-gray-700
                            focus:outline-none focus:shadow-outline hover:cursor-pointer">
                        <XIcon className="w-5 text-slate-100 " />
                    </button>
                </div>

                {/* TODO: make this table mobile friendly? */}
                <div className="overflow-y-scroll overflow-x-scroll">
                    <table className="text-left table-auto">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2 text-right">Amount</th>
                                <th className="px-4 py-2">Date</th>
                                <th className="px-4 py-2">Category</th>
                                <th className="px-4 py-2">Asset Type</th>
                                <th className="px-4 py-2">Currency</th>
                            </tr>
                        </thead>
                        <tbody>
                            { csvData.transactions.map((transaction, i) => (
                                <tr key={i} className={csvData.invalid?.[i] ? "bg-red-900" : ""} title={csvData.invalid?.[i]}>
                                    <td className="px-4 py-2">
                                        <input type="text" value={transaction.name} size={transaction?.name?.length ?? 20}
                                            placeholder="Transaction Name" name="name" onChange={(e) => updateCsvTransaction(e, i)}/>
                                    </td>
                                    <td className={"px-2 py-2 text-right " + (transaction.amount < 0 ? "text-red-400": "text-green-400")}>
                                        <input type="text" value={transaction.amount} size="6" className="text-right" name="amount"
                                            placeholder="Transaction Amount" onChange={(e) => updateCsvTransaction(e, i)}/>
                                    </td>
                                    <td className="px-2 py-2 text-orange-300">
                                        <input type="datetime-local" value={formatDate(transaction.date, DATE_TYPE.INPUT)} name="date"
                                            className="text-right" placeholder="Transaction Date" onChange={(e) => updateCsvTransaction(e, i)} />
                                    </td>
                                    <td className="px-4 py-2 text-sky-400">
                                        <input type="text" value={transaction.category} size="12" placeholder="Transaction category"
                                            name="category" onChange={(e) => updateCsvTransaction(e, i)} />
                                    </td>
                                    <td className="px-2 py-2">
                                        <select value={transaction.assetType} onChange={(e) => updateCsvTransaction(e, i)} name="assetType"
                                            className="px-4 py-2 border rounded-md sm:mx-2 bg-gray-800 text-gray-300 border-gray-600
                                                focus:border-blue-500 focus:outline-none focus:ring">
                                            { assetTypes.map((assetType) => (
                                                <option key={assetType}>{assetType}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-2 text-right">
                                        <select value={transaction.currency} onChange={(e) => updateCsvTransaction(e, i)} name="currency"
                                            className="px-4 py-2 border rounded-md sm:mx-2 bg-gray-800 text-gray-300 border-gray-600
                                                focus:border-blue-500 focus:outline-none focus:ring">
                                            { assetCurrencies[transaction.assetType]?.map((currency) => (
                                                <option key={currency}>{currency}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-row justify-end py-2 mt-2 border-t-1 border-solid border-slate-800">
                    <button disabled={Object.keys(csvData.invalid ?? {}).filter((key) => csvData.invalid?.[key]).length > 0}
                        className="px-4 py-2 text-md font-bold tracking-wide text-white capitalize transition-colors duration-200 flex
                            transform bg-blue-700 rounded-md sm:mx-2 hover:bg-blue-600 focus:outline-none focus:bg-blue-600 hover:cursor-pointer
                            disabled:bg-gray-500 disabled:cursor-not-allowed disabled:hover:bg-gray-500"
                        id="submit-transactions" onClick={submitTransactions}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                            className="size-6 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125
                                0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621
                                0-1.125.504-1.125 1.125v17.25c0 .621.506 1.125 1.125 1.125h12.75c.621 0 1.125-.504
                                1.125-1.125V11.25a10 9 0 0 0-9-9Z" />
                        </svg>
                        Import
                    </button>
                </div>
            </div>
        );
    };

    const closeReviewCsvModal = () => {
        setIsCSVModalOpen(false);
        setCSVData({ transactions: [], invalid: [] });
    };

    return (
        <section id="add-transaction" className="flex flex-col p-4">

            <div className="flex flex-row">
                <button
                    id="add-transaction-button"
                    aria-label="Open Transaction Model"
                    title="Add single transaction"
                    className="inline-flex items-center justify-center h-12 font-medium text-gray-200 transition duration-200 bg-purple-700
                        rounded-l-full shadow-md hover:bg-purple-800 focus:shadow-outline focus:outline-none hover:cursor-pointer w-fit px-4"
                    onClick={() => setIsAddTransactionModalOpen(true)}
                >
                    <PlusIcon className="w-6 h-6 pr-1 text-gray-200" />
                    Add Transaction
                </button>
                {/* This is probably not the best design */}
                <button
                    id="add-transactions-button" aria-label="Import Transactions" title="Add transactions from csv"
                    className="inline-flex items-center justify-center h-12 font-medium text-gray-200 transition duration-200 bg-purple-700
                        rounded-r-full shadow-md hover:bg-purple-800 focus:shadow-outline focus:outline-none hover:cursor-pointer w-fit px-4
                        border-l-2 border-gray-900"
                    onClick={() => csvInput.current.click()}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                        className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125
                            0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621
                            0-1.125.504-1.125 1.125v17.25c0 .621.506 1.125 1.125 1.125h12.75c.621 0 1.125-.504
                            1.125-1.125V11.25a10 9 0 0 0-9-9Z" />
                    </svg>
                </button>
                <input type="file" accept=".csv" id="csv-file-input" className="hidden" onChange={selectFile} ref={csvInput} />
            </div>

            {isAddTransactionModalOpen && <Modal close={closeAddTransactionModal}>
                { addTransactionTemplate() }
            </Modal> }

            {isCSVModalOpen && <Modal close={closeReviewCsvModal}>
                { reviewCsvTemplate() }
            </Modal> }

        </section>
    );
};