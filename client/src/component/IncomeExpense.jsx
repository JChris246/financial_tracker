import { useEffect, useState } from "react";

import { NotificationType, useNotificationContext } from "./Notification";
import { requestSync } from "../utils/Fetch";
import { symbol } from "../utils/constants";

const getTransactions = async (type, displayNotification) => {
    const { msg, success, json } = await requestSync({ url: "/api/transactions/" + type, method: "GET" });

    if (success) {
        return json;
    } else {
        // if status comes back as an error
        // return as an empty array for now
        displayNotification({ message: "An error occurred while getting " + type + " transactions: " + msg, type: NotificationType.Error });
        return [];
    }
};

// TODO: rename this?
const IndexCard = ({ title, amount, accentColor, symbol }) => {
    return (
        <div className={"w-full lg:1/4 border-1 border-l-8 border-gray-600 rounded-md pl-4 py-2 h-fit " + accentColor + "-accent"}>
            <h1 className="text-2xl font-bold text-gray-500 mb-2">{title}</h1>
            <h6 className={"text-4xl font-bold sm:text-5xl mb-1 " + accentColor + "-text-accent"}>
                {symbol} {Math.abs(amount)}
            </h6>
        </div>
    );
};

const IncomeExpense = ({ sync }) => {
    const [amount, setAmount] = useState({
        income: 0,
        expense: 0
    });

    const { display: displayNotification } = useNotificationContext();

    useEffect(() => {
        (async () => {
            // this is probably inefficient
            const income = (await getTransactions("income", displayNotification)).reduce((acc, cur) => acc + cur.amount, 0);
            const spend = (await getTransactions("spend", displayNotification)).reduce((acc, cur) => acc + cur.amount, 0);
            setAmount({
                income,
                expense: spend
            });
        })();
    }, [sync]);

    return (
        <div id="incomeexpense" className="flex flex-col items-center py-10 rounded-sm lg:flex-row
            lg:mx-auto w-full xl:w-2/3 space-y-4 lg:space-y-0 lg:space-x-2 px-8 xl:px-0">
            <IndexCard title="Income" amount={amount.income} accentColor="green" symbol={symbol.CASH}/>
            <IndexCard title="Expense" amount={amount.expense} accentColor="red" symbol={symbol.CASH} />
            {/* Allow user to customize which asset balances appear here? less may have to be shown on smaller screens*/}
            <IndexCard title="Stock" amount={0} accentColor="blue" symbol={symbol.CASH} />
            <IndexCard title="Crypto" amount={0} accentColor="orange" symbol={symbol.CRYPTO}/>
        </div>
    );
};

export default IncomeExpense;