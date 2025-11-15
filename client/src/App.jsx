import "./App.css";

import { useState, useEffect } from "react";

import Balance from "./component/Balance";
import IncomeExpense from "./component/IncomeExpense";
import AssetAllocation from "./component/AssetAllocation";
import TransactionHistoryGlance from "./component/TransactionHistoryGlance";
import Glance from "./component/Glance";
import { NavBar } from "./component/NavBar";
import PerformanceGraph from "./component/PerformanceGraph";

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
        <div className="place-items-center bg-gray-900 min-h-screen px-4 pb-4">
            <NavBar/>

            <Balance refresh={updateValues}/>
            <IncomeExpense/>
            <div className="flex flex-col lg:flex-row w-full items-center lg:items-end lg:justify-center lg:space-x-4
                space-y-4 lg:space-y-0 max-w-7xl lg:mx-auto">
                <AssetAllocation/>
                <PerformanceGraph/>
            </div>
            <div className="flex flex-col lg:flex-row w-full items-center lg:items-end lg:justify-center lg:mt-6 max-w-7xl lg:mx-auto">
                <TransactionHistoryGlance sync={sync}/>
                <Glance />
            </div>
        </div>
    );
}

export default App;
