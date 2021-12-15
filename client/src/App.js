import './App.css';

import Balance from "./component/Balance";
import IncomeExpense from "./component/IncomeExpense";
import TransactionHistory from "./component/TransactionHistory";
import {NavBar} from "./component/NavBar";
// import SpendingGraph from "./component/SpendingGraph";

function App() {
    return (
        <div className="place-items-center">
            <NavBar/>
            
            <Balance balance="$200"/>
            <IncomeExpense income="4864" expense="354"/>
            <TransactionHistory transactionhistory="List of transactions"/>
            {/* <SpendingGraph spendinggraph="Graph"/> */}
            
            <div>
            
            </div>
        </div>
    );
}

export default App;
