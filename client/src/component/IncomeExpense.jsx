import { useEffect, useState } from "react";

import { NotificationType, useNotificationContext } from "./Notification";
import { requestSync } from "../utils/Fetch";

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
        <section id="incomeexpense" className="flex flex-col p-4 mx-4 bg-gray-100 border">

            <div className="relative flex flex-col items-center h-full py-10 mx-auto bg-white rounded-sm sm:items-stretch sm:flex-row">
                <div className="px-12 py-8 md:w-72 ">
                    <h1 className="text-2xl font-bold text-gray-700">Income</h1>
                    <h6 className="text-4xl font-bold text-center text-green-400 sm:text-5xl">
                    $ {amount.income}
                    </h6>
                </div>
                <div className="w-56 h-1 transition duration-300 transform bg-gray-300 rounded-full group-hover:bg-deep-purple-accent-400
                    group-hover:scale-110 sm:h-auto sm:w-1" />
                <div className="px-12 py-8 md:w-72">
                    <h1 className="text-2xl font-bold text-gray-700">Expense</h1>
                    <h6 className="text-4xl font-bold text-center text-red-400 sm:text-5xl">
                    $ {amount.expense}
                    </h6>
                </div>
            </div>

        </section>
    );
}

export default IncomeExpense;