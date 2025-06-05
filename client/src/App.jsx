import "./App.css";

import { useState, useEffect } from "react";

import Balance from "./component/Balance";
import IncomeExpense from "./component/IncomeExpense";
import TransactionHistory from "./component/TransactionHistory";
import {NavBar} from "./component/NavBar";
import {AddTrans} from "./component/AddTrans";
import SpendingGraph from "./component/SpendingGraph";
// import SpendingGraph from "./component/SpendingGraph";

function App() {
    const [sync, setSync] = useState(true);
    const updateValues = () => setSync(false);

    useEffect(() =>  setSync(true), [sync]);

    return (
        <div className="place-items-center z-1">
            <NavBar/>

            <Balance sync={sync}/>
            <IncomeExpense sync={sync}/>
            <TransactionHistory transactionhistory="List of transactions" sync={sync}/>
            {/* <SpendingGraph spendinggraph="Graph"/> */}
            <AddTrans refresh={updateValues}/>
            <SpendingGraph/>
        </div>
    );
}

export default App;
