import "./App.css";

import { useState, useEffect } from "react";

import Balance from "./component/Balance";
import IncomeExpense from "./component/IncomeExpense";
import TransactionHistory from "./component/TransactionHistory";
import Glance from "./component/Glance";
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
