import "./App.css";

import { useState, useEffect } from "react";

import Balance from "./component/Balance";
import IncomeExpense from "./component/IncomeExpense";
import TransactionHistory from "./component/TransactionHistory";
import Glance from "./component/Glance";
import { NavBar } from "./component/NavBar";
import SpendingGraph from "./component/SpendingGraph";

import { useAppContext } from "./AppContext";

import { NotificationType, useNotificationContext } from "./component/Notification";
import { request } from "./utils/Fetch";

function App() {
    const [sync, setSync] = useState(true);
    const updateValues = () => setSync(!sync);
    const { setBalance } = useAppContext();

    const { display: displayNotification } = useNotificationContext();

    useEffect(() => {
        request({
            url: "/api/balance",
            method: "GET",
            callback: ({ msg, success, json }) => {
                if (success) {
                    // get the balances from the response json
                    const { balance, crypto, stock, cash, totalIncome, totalSpend, totalStock, totalCrypto } = json;
                    setBalance({
                        balance, crypto, stock, cash,
                        totalIncome, // cash
                        totalSpend, // cash
                        totalStock, totalCrypto
                    });
                } else {
                    setBalance({ balance: "-", crypto: "-", stock: "-", cash: "-", totalIncome: "-",
                        totalSpend: "-", totalStock: "-", totalCrypto: "-" });
                    displayNotification({ message: "Unable to get balances: " + msg, type: NotificationType.Error });
                }
            }
        });
    }, [sync]);

    return (
        <div className="place-items-center bg-gray-900 min-h-screen">
            <NavBar/>

            <Balance sync={sync} refresh={updateValues}/>
            <IncomeExpense/>
            <div className="flex flex-col lg:flex-row w-full items-center lg:items-end lg:justify-center md:mt-16">
                <Glance type="stock"/>
                <TransactionHistory transactionhistory="List of transactions" sync={sync}/>
                <Glance type="crypto"/>
            </div>
            <SpendingGraph/>
        </div>
    );
}

export default App;
