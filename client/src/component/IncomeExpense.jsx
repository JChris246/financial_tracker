import { useEffect, useState } from "react";

import { NotificationType, useNotificationContext } from "./Notification";
import { request } from "../utils/Fetch";
import { symbol } from "../utils/constants";
import { formatMoney } from "../utils/utils";

// TODO: rename this?
const IndexCard = ({ title, amount, accentColor, symbol }) => {
    return (
        <div id={title} className={"w-full lg:1/4 border-1 border-l-8 border-gray-600 rounded-md pl-4 py-2 h-fit " + accentColor + "-accent"}
            title={title + " value in usd"}>
            <h1 className="text-2xl font-bold text-gray-500 mb-2">{title}</h1>
            <h6 id={title + "-value"} className={"text-4xl font-bold sm:text-5xl mb-1 " + accentColor + "-text-accent"}>
                {symbol} {typeof(amount) === "number" ? formatMoney(Math.abs(amount)) : amount}
            </h6>
        </div>
    );
};

const IncomeExpense = ({ sync }) => {
    const [amount, setAmount] = useState({
        income: 0, // cash
        expense: 0, // cash
        stock: 0,
        crypto: 0
    });

    const { display: displayNotification } = useNotificationContext();

    useEffect(() => {
        // TODO: make this request 1x and store in context
        request({
            url: "/api/balance",
            method: "GET",
            callback: ({ msg, success, json }) => {
                if (success) {
                    const { totalIncome, totalSpend, totalStock, totalCrypto } = json;
                    setAmount({ income: totalIncome, expense: totalSpend, stock: totalStock, crypto: totalCrypto });
                } else {
                    // if status comes back as an error
                    // set balances as - for now
                    setAmount({ income: "-", expense: "-", stock: "-", crypto: "-" });
                    displayNotification({ message: "Unable to get balances: " + msg, type: NotificationType.Error });
                }
            }
        });
    }, [sync]);

    return (
        <div id="incomeexpense" className="flex flex-col items-center py-10 rounded-sm lg:flex-row
            lg:mx-auto w-full xl:w-2/3 space-y-4 lg:space-y-0 lg:space-x-2 px-8 xl:px-0">
            <IndexCard title="Income" amount={amount.income} accentColor="green" symbol={symbol.CASH}/>
            <IndexCard title="Expense" amount={amount.expense} accentColor="red" symbol={symbol.CASH} />
            {/* Allow user to customize which asset balances appear here? less may have to be shown on smaller screens*/}
            <IndexCard title="Stock" amount={amount.stock} accentColor="blue" symbol={symbol.CASH} />
            <IndexCard title="Crypto" amount={amount.crypto} accentColor="orange" symbol={symbol.CRYPTO}/>
        </div>
    );
};

export default IncomeExpense;