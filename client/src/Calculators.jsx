import "./App.css";

import { useState } from "react";

import { NavBar } from "./component/NavBar";

import { NotificationType, useNotificationContext } from "./component/Notification";
import { request } from "./utils/Fetch";
import { formatMoney } from "./utils/utils";

function Calculators() {
    const [interestCalculatorData, setInterestCalculatorData] = useState({
        initial: 0, incremental: 0, period: 1, rate: 1, frequency: "monthly", // user values
        balance: 0, profit: 0, contributed: 0 // server response from calculation
    });

    const { display: displayNotification } = useNotificationContext();

    const calculateCompound = e => {
        e.preventDefault();

        if (interestCalculatorData.initial < 0) {
            displayNotification({ message: "Initial deposit cannot be less 0", type: NotificationType.Error });
            return;
        }

        if (interestCalculatorData.incremental < 0) {
            displayNotification({ message: "Contribution cannot be less 0", type: NotificationType.Error });
            return;
        }

        if (interestCalculatorData.period < 1) {
            displayNotification({ message: "Number of months cannot be less 1", type: NotificationType.Error });
            return;
        }

        if (interestCalculatorData.rate < 0) {
            displayNotification({ message: "Rate cannot be less than 0", type: NotificationType.Error });
            return;
        }

        if (interestCalculatorData.rate === 0) {
            displayNotification({ message: "Rate is 0, expect erroneous results", type: NotificationType.Warning });
        }

        request({
            url: "/api/calculator/compound-interest",
            method: "POST",
            body: JSON.stringify({
                initial: interestCalculatorData.initial,
                interest: interestCalculatorData.rate / 100,
                contribute: interestCalculatorData.incremental,
                months: interestCalculatorData.period,
                frequency: interestCalculatorData.frequency
            }),
            callback: ({ msg, success, json }) => {
                if (success) {
                    setInterestCalculatorData({
                        ...interestCalculatorData,
                        balance: json.balance,
                        profit: json.profit,
                        contributed: json.totalContrib
                    });
                } else {
                    displayNotification({ message: "Unable to add transaction: " + msg, type: NotificationType.Error });
                }
            }
        });
    };

    const enterInterestCalculatorData = e => {
        const { value } = e.target;
        let newObject = {
            ...interestCalculatorData,
            [e.target.name]: e.target.type === "number" && value ? Number(value) : value };
        setInterestCalculatorData(newObject);
    };

    return (
        <div className="place-items-center bg-slate-900 min-h-screen text-gray-300 md:px-4 w-full">
            <NavBar/>

            <div className="w-3/4 mx-auto">
                <section className="flex flex-col lg:flex-row">
                    <form className="w-full lg:w-1/4 flex flex-col px-2 pb-6 mb-6 border-b-1 lg:border-b-0 lg:border-r-1 border-slate-700">
                        <div className="mb-4 w-full md:w-3/4 mx-auto">
                            <label for="initial">Initial Deposit</label>
                            <div className="relative mt-2">
                                <label className="absolute top-2 left-2">$</label>
                                <input
                                    type="number" value={interestCalculatorData.initial} onChange={enterInterestCalculatorData}
                                    name="initial" id="initial-deposit" step={50} min={0}
                                    className="pl-5 pr-4 py-2 border rounded-md bg-gray-800 text-gray-300 border-gray-600
                                        focus:border-blue-500 focus:outline-none focus:ring w-full"
                                    title="initial deposit" />
                            </div>
                        </div>

                        <div className="mb-4 w-full md:w-3/4 mx-auto">
                            <label for="incremental">Contribution Amount (per cycle)</label>
                            <div className="relative mt-2">
                                <label className="absolute top-2 left-2">$</label>
                                <input
                                    type="number" value={interestCalculatorData.incremental} onChange={enterInterestCalculatorData}
                                    name="incremental" id="incremental-amount" step={50} min={0}
                                    className="pl-5 pr-4 py-2 border rounded-md bg-gray-800 text-gray-300 border-gray-600
                                        focus:border-blue-500 focus:outline-none focus:ring w-full"
                                    title="extra amount contributed per cycle"/>
                            </div>
                        </div>

                        <div className="mb-4 flex flex-col w-full md:w-3/4 mx-auto">
                            <label for="period">How many months will you save for?</label>
                            <input
                                type="number" value={interestCalculatorData.period} onChange={enterInterestCalculatorData}
                                name="period" id="period" step={1} min={1}
                                className="px-2 py-2 border rounded-md bg-gray-800 text-gray-300 border-gray-600
                                    focus:border-blue-500 focus:outline-none focus:ring mt-2"
                                title="total period"/>
                        </div>

                        <div className="mb-4 w-full md:w-3/4 mx-auto">
                            <label for="rate">Expected rate of return (per cycle)</label>
                            <div className="relative mt-2">
                                <label className="absolute top-2 right-12">%</label>
                                <input
                                    type="number" value={interestCalculatorData.rate} onChange={enterInterestCalculatorData}
                                    name="rate" id="rate" step={0.1} min={0} required
                                    className="px-2 py-2 border rounded-md bg-gray-800 text-gray-300 border-gray-600
                                        focus:border-blue-500 focus:outline-none focus:ring w-full"
                                    title="rate of return"/>
                            </div>
                        </div>

                        <div className="mb-4 w-full md:w-3/4 mx-auto">
                            <label for="payment-frequency">Expected rate of return (per cycle)</label>
                            <select value={interestCalculatorData.frequency} onChange={enterInterestCalculatorData}
                                name="frequency" required title="payment frequency"
                                id="payment-frequency"
                                className="px-2 py-2 border rounded-md bg-gray-800 text-gray-300 border-gray-600
                                    focus:border-blue-500 focus:outline-none focus:ring mt-2 w-full">
                                <option value="monthly">Monthly</option>
                                <option value="bi-monthly">Bi-Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="semi-annually">SemiAnnually</option>
                                <option value="annually">Annually</option>
                            </select>
                        </div>

                        <button
                            className="px-4 py-2 text-sm font-bold tracking-wide text-white capitalize transition-colors duration-200
                                transform bg-blue-700 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600 hover:cursor-pointer
                                w-full md:w-3/4 mx-auto"
                            onClick={calculateCompound} id="calculate-compound">
                            Calculate
                        </button>
                    </form>

                    <div className="w-full lg:w-2/3 mx-4 p-2 text-slate-100">
                        <div>
                            <h2 className="text-lg mb-1">Estimated Future Balance</h2>
                            <span className="text-4xl font-bold">{"$" + formatMoney(interestCalculatorData.balance)}</span>
                            <hr className="text-slate-700 my-6"/>
                            <div className="flex flex-row justify-between mb-2">
                                <span>Total Contributions</span>
                                <span className="font-bold">{"$" + formatMoney(interestCalculatorData.contributed)}</span>
                            </div>
                            <div className="flex flex-row justify-between mb-2">
                                <span>Interest Earned</span>
                                <span className="font-bold">{"$" + formatMoney(interestCalculatorData.profit)}</span>
                            </div>
                            <div className="flex flex-row justify-between">
                                <span>Initial Deposit</span>
                                <span className="font-bold">{"$" + formatMoney(interestCalculatorData.initial)}</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Calculators;
