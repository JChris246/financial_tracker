import "./App.css";

import { useState } from "react";

import { NavBar } from "./component/NavBar";

import { NotificationType, useNotificationContext } from "./component/Notification";
import { request } from "./utils/Fetch";
import { formatDate, formatMoney, DATE_TYPE } from "./utils/utils";
import { useProgressColor } from "./utils/useProgressColor";

import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// this should probably be a util
const getOptions = title => (
    {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: title,
            },
        },
    }
);

function Calculators() {
    const [interestCalculatorData, setInterestCalculatorData] = useState({
        initial: 0, incremental: 0, period: 1, rate: 1, frequency: "monthly", // user values
        balance: 0, profit: 0, contributed: 0, responseInitial: 0, history: [] // server response from calculation
    });
    const [stockCalculatorData, setStockCalculatorData] = useState({
        initial: "", shares: "", symbol: "", price: "", incremental: 0, divAmount: .5, period: 1, frequency: "monthly", // user values
        balance: 0, profit: 0, contributed: 0, responseInitial: 0, responsePrice: 0, history: [] // server response from calculation
    });
    const [amortizationCalculatorData, setAmortizationCalculatorData] = useState({
        deposit: 0, price: 0, rate: 0, period: 0, // user values
        interestPaid: 0, loanAmount: 0, monthly: 0, totalPaid: 0, history: [], // server response from calculation
    });
    const [income, setIncome] = useState(0);

    const [compoundInterestPie, setCompoundInterestPie] = useState({
        labels: ["Initial Deposit", "Total Contributions", "Interest"],
        datasets: [{
            data: [1, 0, 0],
            backgroundColor: ["#9ae600", "#ffdf20", "#1447e6"],
        }]
    });
    const [stockDividendPie, setStockDividendPie] = useState({
        labels: ["Initial Deposit", "Total Contributions", "Interest"],
        datasets: [{
            data: [1, 0, 0],
            backgroundColor: ["#9ae600", "#ffdf20", "#1447e6"],
        }]
    });
    const [amortizationPie, setAmortizationPie] = useState({
        labels: ["Loan Amount", "Interest", "Deposit"],
        datasets: [{
            data: [1, 0, 0, 0],
            backgroundColor: ["#9ae600", "#1447e6", "#ffdf20"],
        }]
    });

    const [compoundInterestLine, setCompoundInterestLine] = useState({
        labels: ["0"],
        datasets: [
            {
                data: [0],
                label: "contributions",
                backgroundColor: "#ffdf20"
            }, {
                data: [0],
                label: "interest",
                backgroundColor: "#1447e6"
            }, {
                data: [0],
                label: "balance",
                backgroundColor: "#9ae600"
            }
        ]
    });
    const [stockDividendLine, setStockDividendLine] = useState({
        labels: ["0"],
        datasets: [
            {
                data: [0],
                label: "contributions",
                backgroundColor: "#ffdf20"
            }, {
                data: [0],
                label: "interest",
                backgroundColor: "#1447e6"
            }, {
                data: [0],
                label: "balance",
                backgroundColor: "#9ae600"
            }
        ]
    });
    const [amortizationLine, setAmortizationLine] = useState({
        labels: ["0"],
        datasets: [
            {
                data: [0],
                label: "principal paid",
                backgroundColor: "#ffdf20"
            }, {
                data: [0],
                label: "interest paid",
                backgroundColor: "#1447e6"
            }, {
                data: [0],
                label: "loan balance",
                backgroundColor: "#9ae600"
            }
        ]
    });

    const [interestCalcActiveTab, setInterestCalcActiveTab] = useState("1");
    const [dividendCalcActiveTab, setDividendCalcActiveTab] = useState("1");
    const [amortizationCalcActiveTab, setAmortizationCalcActiveTab] = useState("1");

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
                        contributed: json.totalContrib,
                        history: json.history,
                        responseInitial: json.initial
                    });
                    setCompoundInterestPie({
                        datasets: [{
                            data: [interestCalculatorData.initial, json.totalContrib, json.profit],
                            backgroundColor: ["#9ae600", "#ffdf20", "#1447e6"]
                        }],
                        // These labels appear in the legend and in the tooltips when hovering different arcs
                        labels: ["Initial Deposit", "Total Contributions", "Interest"]
                    });

                    setCompoundInterestLine({
                        labels: json.history.map((_, i) => "Period " + (i + 1)),
                        datasets: [
                            {
                                data: json.history.map(h => h.totalContrib),
                                label: "contributions",
                                backgroundColor: "#ffdf20",
                                borderColor: "#ffdf20"
                            }, {
                                data: json.history.map(h => h.profit),
                                label: "interest",
                                backgroundColor: "#1447e6",
                                borderColor: "#1447e6"
                            }, {
                                data: json.history.map(h => h.balance),
                                label: "balance",
                                backgroundColor: "#9ae600",
                                borderColor: "#9ae600"
                            }
                        ]
                    });
                } else {
                    displayNotification({ message: "Unable to calculate compound interest: " + msg, type: NotificationType.Error });
                }
            }
        });
    };

    const calculateStockDividend = e => {
        e.preventDefault();

        if (!stockCalculatorData.initial && !stockCalculatorData.shares) {
            displayNotification({ message: "Missing initial deposit (shares or usd)", type: NotificationType.Error });
            return;
        }

        if (stockCalculatorData.incremental < 0) {
            displayNotification({ message: "Contribution cannot be less 0", type: NotificationType.Error });
            return;
        }

        if (stockCalculatorData.period < 1) {
            displayNotification({ message: "Number of months cannot be less 1", type: NotificationType.Error });
            return;
        }

        if (stockCalculatorData.divAmount < 0) {
            displayNotification({ message: "Rate cannot be less than 0", type: NotificationType.Error });
            return;
        }

        if (!stockCalculatorData.symbol && !stockCalculatorData.price) {
            displayNotification({ message: "Must either have the stock price or symbol", type: NotificationType.Error });
            return;
        }

        request({
            url: "/api/calculator/compound-stock",
            method: "POST",
            body: JSON.stringify({
                initial: stockCalculatorData.initial,
                shares: stockCalculatorData.shares,
                symbol: stockCalculatorData.symbol,
                price: stockCalculatorData.price,
                divAmount: stockCalculatorData.divAmount,
                contribute: stockCalculatorData.incremental,
                months: stockCalculatorData.period,
                frequency: stockCalculatorData.frequency
            }),
            callback: ({ msg, success, json }) => {
                if (success) {
                    setStockCalculatorData({
                        ...stockCalculatorData,
                        balance: json.balance,
                        profit: json.profit,
                        contributed: json.totalContrib,
                        history: json.history,
                        responseInitial: json.initial,
                        responsePrice: json.price
                    });
                    setStockDividendPie({
                        datasets: [{
                            data: [json.initial, json.totalContrib, json.profit],
                            backgroundColor: ["#9ae600", "#ffdf20", "#1447e6"]
                        }],
                        // These labels appear in the legend and in the tooltips when hovering different arcs
                        labels: ["Initial Deposit", "Total Contributions", "Interest"]
                    });

                    setStockDividendLine({
                        labels: json.history.map((_, i) => "Period " + (i + 1)),
                        datasets: [
                            {
                                data: json.history.map(h => h.totalContrib),
                                label: "contributions",
                                backgroundColor: "#ffdf20",
                                borderColor: "#ffdf20"
                            }, {
                                data: json.history.map(h => h.profit),
                                label: "interest",
                                backgroundColor: "#1447e6",
                                borderColor: "#1447e6"
                            }, {
                                data: json.history.map(h => h.balance),
                                label: "balance",
                                backgroundColor: "#9ae600",
                                borderColor: "#9ae600"
                            }
                        ]
                    });
                } else {
                    displayNotification({ message: "Unable to calculate stock dividend: " + msg, type: NotificationType.Error });
                }
            }
        });
    };

    const calculateAmortization = e => {
        e.preventDefault();

        if (amortizationCalculatorData.deposit < 0) {
            displayNotification({ message: "Deposit cannot be less 0", type: NotificationType.Error });
            return;
        }

        if (amortizationCalculatorData.price < 0) {
            displayNotification({ message: "Price cannot be less 0", type: NotificationType.Error });
            return;
        }

        if (amortizationCalculatorData.period < 1) {
            displayNotification({ message: "Number of months cannot be less 1", type: NotificationType.Error });
            return;
        }

        if (amortizationCalculatorData.rate < 0) {
            displayNotification({ message: "Interest rate cannot be less than 0", type: NotificationType.Error });
            return;
        }

        request({
            url: "/api/calculator/amortization",
            method: "POST",
            body: JSON.stringify({
                down: amortizationCalculatorData.deposit,
                interest: amortizationCalculatorData.rate / 100,
                price: amortizationCalculatorData.price,
                months: amortizationCalculatorData.period
            }),
            callback: ({ msg, success, json }) => {
                if (success) {
                    setAmortizationCalculatorData({
                        ...amortizationCalculatorData,
                        interestPaid: json.interestPaid,
                        history: json.history,
                        loanAmount: json.loanAmount,
                        monthly: json.monthly,
                        totalPaid: json.totalPaid,
                    });
                    setAmortizationPie({
                        datasets: [{
                            data: [json.loanAmount, json.interestPaid, amortizationCalculatorData.deposit],
                            backgroundColor: ["#9ae600", "#1447e6", "#ffdf20"]
                        }],
                        // These labels appear in the legend and in the tooltips when hovering different arcs
                        labels: ["Loan Amount", "Interest Paid", "Deposit"]
                    });

                    setAmortizationLine({
                        labels: json.history.map((_, i) => "Period " + (i + 1)),
                        datasets: [
                            {
                                data: json.history.map(h => h.principalPaid),
                                label: "principal paid",
                                backgroundColor: "#ffdf20",
                                borderColor: "#ffdf20"
                            }, {
                                data: json.history.map(h => h.interestPaid),
                                label: "interest paid",
                                backgroundColor: "#1447e6",
                                borderColor: "#1447e6"
                            }, {
                                data: json.history.map(h => h.loanBalance),
                                label: "loan balance",
                                backgroundColor: "#9ae600",
                                borderColor: "#9ae600"
                            }
                        ]
                    });
                } else {
                    displayNotification({ message: "Unable to calculate amortization schedule: " + msg, type: NotificationType.Error });
                }
            }
        });

        if (amortizationCalculatorData.monthlyIncome && amortizationCalculatorData.monthlyIncome !== 0) {
            setIncome(amortizationCalculatorData.monthlyIncome);
            return;
        }

        const sixMonths = 1000 * 60 * 60 * 24 * 30 * 6;
        const from = formatDate(new Date(new Date().getTime() - sixMonths), DATE_TYPE.DISPLAY_DATE);
        const to = formatDate(new Date(), DATE_TYPE.DISPLAY_DATE);
        request({
            url: `/api/balance/progress/${from}/${to}`,
            method: "GET",
            callback: ({ msg, success, json }) => {
                if (!success) {
                    displayNotification({ message: "Unable to determine recent income value: " + msg, type: NotificationType.Warning });
                } else {
                    setIncome(json.avgMonthlyIncome);
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

    const enterStockCalculatorData = e => {
        const { value } = e.target;
        let newObject = {
            ...stockCalculatorData,
            [e.target.name]: e.target.type === "number" && value ? Number(value) : value };
        setStockCalculatorData(newObject);
    };

    const enterAmortizationCalculatorData = e => {
        const { value } = e.target;
        let newObject = {
            ...amortizationCalculatorData,
            [e.target.name]: e.target.type === "number" && value ? Number(value) : value };
        setAmortizationCalculatorData(newObject);
    };

    const HistoryTable = ({ historyData, calculator }) =>
        <div className="overflow-y-scroll overflow-x-scroll w-full mt-8">
            <table className="text-left table-auto w-full text-lg border-2 border-slate-800 mb-2" id={calculator + "-table"}>
                <thead>
                    <tr className="bg-slate-800">
                        <th className="px-4 py-2">Period</th>
                        <th className="px-4 py-2">Starting Balance</th>
                        <th className="px-4 py-2">Cumulative Contributions</th>
                        <th className="px-4 py-2">Interest Earned</th>
                        <th className="px-4 py-2">Cumulative Interest</th>
                        <th className="px-4 py-2">Total Balance</th>
                    </tr>
                </thead>
                <tbody>
                    { historyData
                        .map((item, i) => (
                            <tr key={i} className={"hover:bg-slate-700" + (i % 2 === 1 ? " bg-gray-800" : "")}>
                                <td className="pl-4 font-thin">{i+1}</td>
                                <td className="px-4 py-2">{formatMoney(item.startBalance)}</td>
                                <td className="px-4 py-2">{formatMoney(item.totalContrib)}</td>
                                <td className="px-4 py-2">{formatMoney(item.stepEarned)}</td>
                                <td className="px-4 py-2">{formatMoney(item.profit)}</td>
                                <td className="px-4 py-2">{formatMoney(item.balance)}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>;

    const AmortizationTable = ({ historyData }) =>
        <div className="overflow-y-scroll overflow-x-scroll w-full mt-8">
            <table className="text-left table-auto w-full text-lg border-2 border-slate-800 mb-2" id="amortization-table">
                <thead>
                    <tr className="bg-slate-800">
                        <th className="px-4 py-2">Period</th>
                        <th className="px-4 py-2">Principal Paid</th>
                        <th className="px-4 py-2">Interest Paid</th>
                        <th className="px-4 py-2">Cumulative Principal</th>
                        <th className="px-4 py-2">Cumulative Interest</th>
                        <th className="px-4 py-2">Remaining Balance</th>
                    </tr>
                </thead>
                <tbody>
                    { historyData
                        .map((item, i) => (
                            <tr key={i} className={"hover:bg-slate-700" + (i % 2 === 1 ? " bg-gray-800" : "")}>
                                <td className="pl-4 font-thin">{i+1}</td>
                                <td className="px-4 py-2">{formatMoney(item.currentPrincipalPaid)}</td>
                                <td className="px-4 py-2">{formatMoney(item.currentInterest)}</td>
                                <td className="px-4 py-2">{formatMoney(item.principalPaid)}</td>
                                <td className="px-4 py-2">{formatMoney(item.interestPaid)}</td>
                                <td className="px-4 py-2">{formatMoney(item.loanBalance)}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>;

    const DetailTabs = ({ calculator, toggler, activeTab }) =>
        <div className="flex flex-row w-fit">
            <button className="rounded-lg md:px-4 flex w-full md:w-fit cursor-pointer" onClick={() => toggler("0")} id={calculator + "-line-tab"}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                    stroke={activeTab === "0" ? "#1447e6" : "white"} className="size-12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125
                    1.125v6.75C7.5 20.496 6.996 21 6.374 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621
                    0 1.125.504 1.125 1.125v11.25c0 .621-.502 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5
                    4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.502 1.125-1.125 1.125h-2.25a1.125 1.125 0 0
                    1-1.125-1.125V4.125Z" />
                </svg>
            </button>

            <button className="rounded-lg px-4 flex w-full md:w-fit cursor-pointer" onClick={() => toggler("1")} id={calculator + "-pie-tab"}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                    stroke={activeTab === "1" ? "#1447e6" : "white"} className="size-12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
                </svg>
            </button>

            <button className="rounded-lg md:px-4 flex w-full md:w-fit cursor-pointer" onClick={() => toggler("2")} id={calculator + "-table-tab"}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                    stroke={activeTab === "2" ? "#1447e6" : "white"} className="size-12">
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
            </button>
        </div>;

    return (
        <div className="place-items-center bg-slate-900 min-h-screen text-gray-300 md:px-4 w-full pb-8 lg:pb-16">
            <NavBar/>

            {/* Compound Interest Calculator */}
            <div className="w-3/4 mx-auto">
                <h2 className="text-2xl text-slate-100 font-bold mb-12">Compound Interest Calculator</h2>
                <section className="flex flex-col lg:flex-row">
                    <form className="w-full lg:w-1/4 flex flex-col px-2 pb-6 mb-6 lg:pb-0 lg:mb-0 border-b-1
                        lg:border-b-0 lg:border-r-1 border-slate-700">
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
                                name="frequency" required title="payment frequency" id="payment-frequency"
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
                            <div className="flex flex-col md:flex-row justify-between md:items-end">
                                <div className="mb-8 md:mb-0">
                                    <h3 className="text-lg mb-1">Estimated Future Balance</h3>
                                    <span className="text-4xl font-bold">{"$" + formatMoney(interestCalculatorData.balance)}</span>
                                </div>
                                <DetailTabs calculator={"compound-interest"} toggler={setInterestCalcActiveTab} activeTab={interestCalcActiveTab} />
                            </div>
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
                                <span className="font-bold">{"$" + formatMoney(interestCalculatorData.responseInitial)}</span>
                            </div>
                        </div>

                        { interestCalcActiveTab === "1" && <div className="w-full lg:w-1/3 mx-auto p-2">
                            <Doughnut options={getOptions("Savings breakdown")} data={compoundInterestPie}/>
                        </div> }
                        { interestCalcActiveTab === "0" && <Line options={getOptions("Growth chart")} data={compoundInterestLine}/> }
                        { interestCalcActiveTab === "2" &&
                            <HistoryTable historyData={interestCalculatorData.history} calculator={"compound-interest"}/> }
                    </div>
                </section>
            </div>

            <hr className="text-slate-700 my-12 w-3/4 mx-auto"/>

            {/* Stock Dividend Calculator */}
            <div className="w-3/4 mx-auto">
                <h2 className="text-2xl text-slate-100 font-bold mb-12">Stock Dividend Calculator</h2>
                <section className="flex flex-col lg:flex-row">
                    <form className="w-full lg:w-1/4 flex flex-col px-2 pb-6 mb-6 lg:pb-0 lg:mb-0 border-b-1
                        lg:border-b-0 lg:border-r-1 border-slate-700">
                        <div className="mb-2 w-full md:w-3/4 mx-auto">
                            <label for="initial-deposit-stock">Initial Deposit (in USD)</label>
                            <div className="relative mt-2">
                                <label className="absolute top-2 left-2">$</label>
                                <input
                                    type="number" value={stockCalculatorData.initial} onChange={enterStockCalculatorData}
                                    name="initial" id="initial-deposit-stock" step={50} min={0}
                                    className="pl-5 pr-4 py-2 border rounded-md bg-gray-800 text-gray-300 border-gray-600
                                        focus:border-blue-500 focus:outline-none focus:ring w-full"
                                    title="initial deposit in usd" />
                            </div>
                        </div>

                        <span className="block my-2 md:w-3/4 mx-auto font-bold">OR</span>

                        <div className="mb-4 w-full md:w-3/4 mx-auto">
                            <label for="initial-shares">Initial Shares</label>
                            <input
                                type="number" value={stockCalculatorData.shares} onChange={enterStockCalculatorData}
                                name="shares" id="initial-shares" step={10} min={0}
                                className="px-2 py-2 border rounded-md bg-gray-800 text-gray-300 border-gray-600
                                    focus:border-blue-500 focus:outline-none focus:ring w-full mt-2"
                                title="initial deposit in usd" />
                        </div>

                        <hr className="text-slate-700 my-8 w-3/4 mx-auto"/>

                        {/* TODO: Make this a drop down select and auto populate the price? */}
                        <div className="mb-4 w-full md:w-3/4 mx-auto">
                            <label for="stock-symbol">Stock Symbol (optional if you set price)</label>
                            <input
                                type="text" value={stockCalculatorData.symbol} onChange={enterStockCalculatorData}
                                name="symbol" id="stock-symbol"
                                className="px-2 py-2 border rounded-md bg-gray-800 text-gray-300 border-gray-600
                                    focus:border-blue-500 focus:outline-none focus:ring w-full mt-2" title="stock symbol" />
                        </div>

                        <div className="mb-4 w-full md:w-3/4 mx-auto">
                            <label for="stock-price">Stock Price (optional)</label>
                            <div className="relative mt-2">
                                <label className="absolute top-2 left-2">$</label>
                                <input
                                    type="number" value={stockCalculatorData.price} onChange={enterStockCalculatorData}
                                    name="price" id="stock-price" step={50} min={0}
                                    className="pl-5 pr-4 py-2 border rounded-md bg-gray-800 text-gray-300 border-gray-600
                                        focus:border-blue-500 focus:outline-none focus:ring w-full"
                                    title="initial deposit in usd" />
                            </div>
                        </div>

                        <div className="mb-4 w-full md:w-3/4 mx-auto">
                            <label for="div-rate">Dividend payout per share</label>
                            <div className="relative mt-2">
                                <label className="absolute top-2 left-2">$</label>
                                <input
                                    type="number" value={stockCalculatorData.divAmount} onChange={enterStockCalculatorData}
                                    name="divAmount" id="div-rate" step={0.1} min={0}
                                    className="pl-5 pr-4 py-2 border rounded-md bg-gray-800 text-gray-300 border-gray-600
                                        focus:border-blue-500 focus:outline-none focus:ring w-full"
                                    title="Dividend payout per share" />
                            </div>
                        </div>

                        <div className="mb-4 w-full md:w-3/4 mx-auto">
                            <label for="incremental-stock">Contribution Amount (per cycle in USD)</label>
                            <div className="relative mt-2">
                                <label className="absolute top-2 left-2">$</label>
                                <input
                                    type="number" value={stockCalculatorData.incremental} onChange={enterStockCalculatorData}
                                    name="incremental" id="incremental-stock-amount" step={50} min={0}
                                    className="pl-5 pr-4 py-2 border rounded-md bg-gray-800 text-gray-300 border-gray-600
                                        focus:border-blue-500 focus:outline-none focus:ring w-full"
                                    title="extra amount contributed per cycle"/>
                            </div>
                        </div>

                        <div className="mb-4 flex flex-col w-full md:w-3/4 mx-auto">
                            <label for="period-stock">How many months will you save for?</label>
                            <input
                                type="number" value={stockCalculatorData.period} onChange={enterStockCalculatorData}
                                name="period" id="period-stock" step={1} min={1}
                                className="px-2 py-2 border rounded-md bg-gray-800 text-gray-300 border-gray-600
                                    focus:border-blue-500 focus:outline-none focus:ring mt-2" title="total period"/>
                        </div>

                        <div className="mb-4 w-full md:w-3/4 mx-auto">
                            <label for="dividend-frequency">Expected rate of return (per cycle)</label>
                            <select value={stockCalculatorData.frequency} onChange={enterStockCalculatorData}
                                name="frequency" required title="payment frequency" id="dividend-frequency"
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
                            onClick={calculateStockDividend} id="calculate-compound-stock">
                            Calculate
                        </button>
                    </form>

                    <div className="w-full lg:w-2/3 mx-4 p-2 text-slate-100">
                        <div>
                            <div className="flex flex-col md:flex-row justify-between md:items-end">
                                <div className="mb-8 md:mb-0">
                                    <h3 className="text-lg mb-1">Estimated Future Balance</h3>
                                    <span className="text-4xl font-bold">{"$" + formatMoney(stockCalculatorData.balance)}</span>
                                </div>
                                <DetailTabs calculator="dividend" toggler={setDividendCalcActiveTab} activeTab={dividendCalcActiveTab} />
                            </div>
                            <hr className="text-slate-700 my-6"/>
                            <div className="flex flex-row justify-between mb-2">
                                <span>Total Contributions</span>
                                <span className="font-bold">{"$" + formatMoney(stockCalculatorData.contributed)}</span>
                            </div>
                            <div className="flex flex-row justify-between mb-2">
                                <span>Dividends Earned</span>
                                <span className="font-bold">{"$" + formatMoney(stockCalculatorData.profit)}</span>
                            </div>
                            <div className="flex flex-row justify-between mb-2">
                                <span>Initial Deposit</span>
                                <span className="font-bold">{"$" + formatMoney(stockCalculatorData.responseInitial)}</span>
                            </div>
                            <div className="flex flex-row justify-between">
                                <span>Stock Price</span>
                                <span className="font-bold">{"$" + formatMoney(stockCalculatorData.responsePrice)}</span>
                            </div>
                        </div>

                        { dividendCalcActiveTab === "1" && <div className="w-full lg:w-1/3 mx-auto p-2">
                            <Doughnut options={getOptions("Savings breakdown")} data={stockDividendPie}/>
                        </div> }
                        { dividendCalcActiveTab === "0" && <Line options={getOptions("Growth chart")} data={stockDividendLine}/> }
                        { dividendCalcActiveTab === "2" && <HistoryTable historyData={stockCalculatorData.history} calculator="dividend"/> }
                    </div>
                </section>
            </div>

            <hr className="text-slate-700 my-12 w-3/4 mx-auto"/>

            {/* Amortization Calculator */}
            <div className="w-3/4 mx-auto">
                <h2 className="text-2xl text-slate-100 font-bold mb-12">Amortization Calculator</h2>
                <section className="flex flex-col lg:flex-row">
                    <form className="w-full lg:w-1/4 flex flex-col px-2 pb-6 mb-6 lg:pb-0 lg:mb-0 border-b-1
                        lg:border-b-0 lg:border-r-1 border-slate-700">
                        <div className="mb-4 w-full md:w-3/4 mx-auto">
                            <label for="amortization-price">Price</label>
                            <div className="relative mt-2">
                                <label className="absolute top-2 left-2">$</label>
                                <input
                                    type="number" value={amortizationCalculatorData.price} onChange={enterAmortizationCalculatorData}
                                    name="price" id="amortization-price" step={50} min={0}
                                    className="pl-5 pr-4 py-2 border rounded-md bg-gray-800 text-gray-300 border-gray-600
                                        focus:border-blue-500 focus:outline-none focus:ring w-full"
                                    title="total cost of the house/car"/>
                            </div>
                        </div>

                        <div className="mb-4 w-full md:w-3/4 mx-auto">
                            <label for="amortization-deposit">Deposit</label>
                            <div className="relative mt-2">
                                <label className="absolute top-2 left-2">$</label>
                                <input
                                    type="number" value={amortizationCalculatorData.deposit} onChange={enterAmortizationCalculatorData}
                                    name="deposit" id="amortization-deposit" step={50} min={0}
                                    className="pl-5 pr-4 py-2 border rounded-md bg-gray-800 text-gray-300 border-gray-600
                                        focus:border-blue-500 focus:outline-none focus:ring w-full"
                                    title="amortization deposit" />
                            </div>
                        </div>

                        <div className="mb-4 w-full md:w-3/4 mx-auto">
                            <label for="amortization-monthly-income">Monthly Income (Optional)</label>
                            <div className="relative mt-2">
                                <label className="absolute top-2 left-2">$</label>
                                <input
                                    type="number" value={amortizationCalculatorData.monthlyIncome} onChange={enterAmortizationCalculatorData}
                                    name="monthlyIncome" id="amortization-monthly-income" step={50} min={0}
                                    className="pl-5 pr-4 py-2 border rounded-md bg-gray-800 text-gray-300 border-gray-600
                                        focus:border-blue-500 focus:outline-none focus:ring w-full"
                                    title="monthly income" />
                            </div>
                        </div>

                        <div className="mb-4 flex flex-col w-full md:w-3/4 mx-auto">
                            <label for="amortization-period">How many months for the loan period?</label>
                            <input
                                type="number" value={amortizationCalculatorData.period} onChange={enterAmortizationCalculatorData}
                                name="period" id="amortization-period" step={1} min={1}
                                className="px-2 py-2 border rounded-md bg-gray-800 text-gray-300 border-gray-600
                                    focus:border-blue-500 focus:outline-none focus:ring mt-2"
                                title="total period"/>
                        </div>

                        <div className="mb-4 w-full md:w-3/4 mx-auto">
                            <label for="amortization-rate">Interest Rate</label>
                            <div className="relative mt-2">
                                <label className="absolute top-2 right-12">%</label>
                                <input
                                    type="number" value={amortizationCalculatorData.rate} onChange={enterAmortizationCalculatorData}
                                    name="rate" id="amortization-rate" step={0.1} min={0} required
                                    className="px-2 py-2 border rounded-md bg-gray-800 text-gray-300 border-gray-600
                                        focus:border-blue-500 focus:outline-none focus:ring w-full"
                                    title="rate of return"/>
                            </div>
                        </div>

                        <button
                            className="px-4 py-2 text-sm font-bold tracking-wide text-white capitalize transition-colors duration-200
                                transform bg-blue-700 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600 hover:cursor-pointer
                                w-full md:w-3/4 mx-auto"
                            onClick={calculateAmortization} id="calculate-amortization">
                            Calculate
                        </button>
                    </form>

                    <div className="w-full lg:w-2/3 mx-4 p-2 text-slate-100">
                        <div>
                            <div className="flex flex-col md:flex-row justify-between md:items-end">
                                <div className="mb-8 md:mb-0">
                                    <h3 className="text-lg mb-1">Estimated Monthly Payment</h3>
                                    <span className="text-4xl font-bold">{"$" + formatMoney(amortizationCalculatorData.monthly)}</span>
                                </div>
                                <DetailTabs calculator={"amortization"} toggler={setAmortizationCalcActiveTab}
                                    activeTab={amortizationCalcActiveTab} />
                            </div>
                            <hr className="text-slate-700 my-6"/>

                            {income !== 0 && <div className="w-full h-8 mb-4 flex justify-between">
                                <div className="rounded" style={{ height: "100%", width: (amortizationCalculatorData.monthly / income) * 100 + "%",
                                    // I do as I like
                                    // eslint-disable-next-line react-hooks/rules-of-hooks
                                    background: useProgressColor(100 - Math.min(((amortizationCalculatorData.monthly / income) * 100), 100)) }}></div>
                                <div className="flex ml-4 space-x-2">
                                    <span className="text-xl">{Math.ceil((amortizationCalculatorData.monthly / income) * 100) + "% "}</span>
                                    <span className="text-xl" id="risk-text"
                                        // I do as I like
                                        // eslint-disable-next-line react-hooks/rules-of-hooks
                                        style={{ color: useProgressColor(100 - Math.min(((amortizationCalculatorData.monthly / income) * 100), 100)),
                                            "font-weight": "bold" }}>{
                                            amortizationCalculatorData.monthly / income < .25 && "Safe" ||
                                            amortizationCalculatorData.monthly / income < .3 && "Comfortable" ||
                                            amortizationCalculatorData.monthly / income < .4 && "Stretch" || "Aggressive"
                                        }
                                    </span>
                                </div>
                            </div>}

                            {income !== 0 &&
                                <div className="flex flex-row justify-between mb-2">
                                    <span>Avg Monthly Income</span>
                                    <span className="font-bold">{"$" + formatMoney(income)}</span>
                                </div>
                            }
                            <div className="flex flex-row justify-between mb-2">
                                <span>Price</span>
                                <span className="font-bold">{"$" + formatMoney(amortizationCalculatorData.price)}</span>
                            </div>
                            <div className="flex flex-row justify-between mb-2">
                                <span>Loan Amount</span>
                                <span className="font-bold">{"$" + formatMoney(amortizationCalculatorData.loanAmount)}</span>
                            </div>
                            <div className="flex flex-row justify-between mb-2">
                                <span>Total Interest Paid</span>
                                <span className="font-bold">{"$" + formatMoney(amortizationCalculatorData.interestPaid)}</span>
                            </div>
                            <div className="flex flex-row justify-between mb-2">
                                <span>Total Paid (without deposit)</span>
                                <span className="font-bold">{"$" + formatMoney(amortizationCalculatorData.totalPaid)}</span>
                            </div>
                            <div className="flex flex-row justify-between">
                                <span>Total Paid (with deposit)</span>
                                <span className="font-bold" id="total-total-paid">
                                    {"$" + formatMoney(amortizationCalculatorData.totalPaid + amortizationCalculatorData.deposit)}</span>
                            </div>
                        </div>

                        { amortizationCalcActiveTab === "1" && <div className="w-full lg:w-1/3 mx-auto p-2">
                            <Doughnut options={getOptions("amortization breakdown")} data={amortizationPie}/>
                        </div> }
                        { amortizationCalcActiveTab === "0" && <Line options={getOptions("Payment chart")} data={amortizationLine}/> }
                        { amortizationCalcActiveTab === "2" &&
                            <AmortizationTable historyData={amortizationCalculatorData.history}/> }
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Calculators;
