import React, { useState } from "react";
import { PlusIcon, XIcon } from "@heroicons/react/solid";

export const AddTrans = ({ refresh }) => {
    const formatDate = (d) => {
        const pad = (v, n = 2) => {
            v = v + ""; // convert to string
            if (v.length === n)
                return v;
            for (let i = 0; i < n; i++) {
                v = "0" + v;
                if (v.length >= n)
                    break;
            }
            return v;
        };

        // YYYY-MM-DDThh:mm
        // 2022-01-07T23:43:09
        const date = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
        const time = pad(d.getHours()) + ":" + pad(d.getMinutes());
        return date + "T" + time;
    };

    const [isTransModelOpen, setIsTransModelOpen] = useState(false);
    const [isTestModelOpen, setIsTestModelOpen] = useState(false);
    const [transaction, setTransaction] = useState({
        name: "",
        amount: "",
        date: formatDate(new Date())
    });

    const enterTransaction = (e) => {
        setTransaction({
            ...transaction,
            [e.target.name]: e.target.value
        });
    };

    const addTransaction = async (e) => {
        e.preventDefault();

        const res = await fetch("/api/transaction", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(transaction)
        });

        if (res.status !== 201)
            alert((await res.json()).msg);
        else {
            // clear input and close input
            setTransaction({ name: "", amount: "", date: "" });
            setIsTestModelOpen(false);
            refresh();
        }
    }

    return (
        <section id="addtransaction" className="flex flex-col p-4 mx-4 bg-gray-100 border">

            <div className="relative flex flex-col items-center h-full py-10 mx-auto rounded-sm sm:items-stretch sm:flex-row">
                {/*<div className="mx-auto bg-gray-300">
                        <div className="relative flex items-center justify-between w-auto max-w-sm py-5 mx-auto border-full">*/}

                <button
                    aria-label="Open Trans Model"
                    title="Open Trans Model"
                    className="inline-flex items-center justify-center h-12 px-6 font-medium text-gray-900 transition duration-200 bg-purple-300
                        rounded shadow-md hover:bg-purple-200 focus:shadow-outline focus:outline-none"
                    onClick={() => setIsTestModelOpen(true)}
                >
                    <PlusIcon className="w-6 h-6 pr-1 text-gray-900" />
                    Add Transaction
                </button>

                {/*<button
                    aria-label="Open Trans Model"
                    title="Open Trans Model"
                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex
                        items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    onClick={() => setIsTestModelOpen(true)}
                >
                    <PlusIcon className="w-5 h-5 text-gray-600"/>
                    Test
                </button>*/}
            </div>

            {isTestModelOpen && (
                <div
                    className="fixed inset-0 z-10 items-center justify-center overflow-x-hidden overflow-y-auto outline-none
                        focus:outline-none backdrop-blur-md">
                    <div className="relative w-auto max-w-sm mx-auto my-6 border backdrop-blur-md">

                        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">

                            <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
                                <h3 className="text-3xl font-semibold">
                                    Add Transaction
                                </h3>
                                <button
                                    aria-label="Close Menu"
                                    title="Close Menu"
                                    className="object-right p-2 -mt-2 -mr-2 transition duration-200 rounded hover:bg-gray-200 focus:bg-gray-200
                                        focus:outline-none focus:shadow-outline"
                                    onClick={() => setIsTestModelOpen(false)}
                                >
                                    <XIcon className="w-5 text-red-600" />
                                </button>
                            </div>

                            <form className="relative flex-auto p-6" onSubmit={addTransaction}>
                                <div className="flex flex-col mt-0 space-y-2 sm:justify-center sm:-mx-2">
                                    <input
                                        type="text" value={transaction.name} onChange={enterTransaction} name="name" required
                                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md sm:mx-2 dark:bg-gray-800
                                            dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500
                                            focus:outline-none focus:ring"
                                        placeholder="Transaction Name" />
                                    <input type="number" value={transaction.amount} onChange={enterTransaction} name="amount" required
                                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md sm:mx-2 dark:bg-gray-800
                                            dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500
                                            focus:outline-none focus:ring"
                                        placeholder="Transaction Amount" />

                                    <input type="datetime-local" value={transaction.date} onChange={enterTransaction} name="date" required
                                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md sm:mx-2 dark:bg-gray-800
                                            dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500
                                            focus:outline-none focus:ring"
                                        placeholder="Transaction Date" />

                                    <button
                                        className="px-4 py-2 text-sm font-bold tracking-wide text-white capitalize transition-colors duration-200
                                            transform bg-blue-700 rounded-md sm:mx-2 hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                        onClick={addTransaction}>
                                        Add
                                    </button>
                                </div>
                            </form>

                            {/*<div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-blueGray-200">
                                <button
                                    className="px-6 py-2 mb-1 mr-1 text-sm font-bold text-green-500 uppercase transition-all duration-150 ease-linear
                                        outline-none background-transparent focus:outline-none"
                                    type="button"
                                >
                                    Add
                                </button>
                                <button
                                    className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase transition-all duration-150 ease-linear
                                        bg-green-300 rounded shadow outline-none active:bg-emerald-600 hover:shadow-lg focus:outline-none"
                                    type="button">
                                    Add
                                </button>
                            </div>*/}
                        </div>
                    </div>
                </div>
            )}

            {isTransModelOpen && (
                <div className="fixed top-0 bottom-0 left-0 right-0 z-10">
                    <div className="p-5 bg-white border rounded shadow-sm dark:bg-gray-700">
                        <div className="flex items-center justify-between mb-4">

                            <span className="ml-2 text-xl font-bold tracking-wide text-gray-800 uppercase">
                                <header>
                                    <h1 className="py-12 text-3xl text-gray-200 underline-decoration">Finance Tracker</h1>
                                </header>
                            </span>

                            <div>
                                <button
                                    aria-label="Close Menu"
                                    title="Close Menu"
                                    className="p-2 -mt-2 -mr-2 transition duration-200 rounded hover:bg-gray-200 focus:bg-gray-200
                                        focus:outline-none focus:shadow-outline"
                                    onClick={() => setIsTransModelOpen(false)}
                                >
                                    <svg className="w-5 text-gray-600" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M19.7,4.3c-0.4-0.4-1-0.4-1.4,0L12,10.6L5.7,4.3c-0.4-0.4-1-0.4-1.4,0s-0.4,1,0,1.4l6.3,6.3l-6.3,
                                                6.3 c-0.4,0.4-0.4,1,0,1.4C4.5,19.9,4.7,20,5,20s0.5-0.1,0.7-0.3l6.3-6.3l6.3,6.3c0.2,0.2,0.5,0.3,0.7,
                                                0.3s0.5-0.1,0.7-0.3 c0.4-0.4,0.4-1,0-1.4L13.4,12l6.3-6.3C20.1,5.3,20.1,4.7,19.7,4.3z"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </section>
    );
};