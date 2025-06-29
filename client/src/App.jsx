import "./App.css";

import { useState, useEffect } from "react";

import Balance from "./component/Balance";
import IncomeExpense from "./component/IncomeExpense";
import TransactionHistory from "./component/TransactionHistory";
import { NavBar } from "./component/NavBar";
import SpendingGraph from "./component/SpendingGraph";

function App() {
    const [sync, setSync] = useState(true);
    const updateValues = () => setSync(false);

    useEffect(() => setSync(true), [sync]);

    return (
        <div className="place-items-center bg-gray-900 min-h-screen">
            <NavBar/>

            <Balance sync={sync} refresh={updateValues}/>
            <IncomeExpense sync={sync}/>
            <div class="flex flex-col lg:flex-row w-full items-center lg:items-start lg:justify-center">
                <TransactionHistory transactionhistory="List of transactions" sync={sync}/>
                <SpendingGraph/>
            </div>
        </div>
    );
}

export default App;
