import './App.css';

import Balance from "./component/Balance";
import IncomeExpense from "./component/IncomeExpense";
import TransactionHistory from "./component/TransactionHistory";
// import SpendingGraph from "./component/SpendingGraph";

function App() {
    return (
        <div className="place-items-center">
            <header>
                <h1 className="text-3xl text-gray-200 py-12 underline-decoration">Finance Tracker</h1>
            </header>
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
