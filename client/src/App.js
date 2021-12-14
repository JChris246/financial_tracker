import './App.css';

import Balance from "./component/Balance";
import IncomeExpense from "./component/IncomeExpense";
import TransactionHistory from "./component/TransactionHistory";
// import SpendingGraph from "./component/SpendingGraph";

function App() {
    return (
        <div className="place-items-center">
            <header>
                <h1 className="text-3xl text-gray-800">Finance Tracker</h1>
            </header>
            <Balance balance="$200"/>
            <IncomeExpense/>
            <TransactionHistory transactionhistory="List of transactions"/>
            {/* <SpendingGraph spendinggraph="Graph"/> */}
            
            <div>
            
            </div>
        </div>
    );
}

export default App;
