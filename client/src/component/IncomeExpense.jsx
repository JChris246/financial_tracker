import { symbol } from "../utils/constants";
import { formatMoney } from "../utils/utils";

import { useAppContext } from "../AppContext";

// TODO: rename this?
const IndexCard = ({ title, amount, accentColor, symbol }) => {
    return (
        <div id={title} className={"w-full lg:w-1/4 border-1 border-l-8 border-gray-600 rounded-md pl-4 py-2 h-fit " + accentColor + "-accent"}
            title={title + " value in usd"}>
            <h1 className="text-2xl font-bold text-gray-500 mb-2">{title}</h1>
            <h6 id={title + "-value"} className={"text-4xl font-bold sm:text-5xl mb-1 " + accentColor + "-text-accent"}>
                {symbol} {typeof(amount) === "number" ? formatMoney(Math.abs(amount)) : amount}
            </h6>
        </div>
    );
};

const IncomeExpense = () => {
    const { balance } = useAppContext();
    const { totalIncome: income, totalSpend: expense, totalStock: stock, totalCrypto: crypto } = balance;

    return (
        <div id="incomeexpense" className="flex flex-col items-center py-10 rounded-sm lg:flex-row
            lg:mx-auto w-full xl:w-2/3 space-y-4 lg:space-y-0 lg:space-x-2 px-8 xl:px-0">
            <IndexCard title="Income" amount={income} accentColor="green" symbol={symbol.CASH}/>
            <IndexCard title="Expense" amount={expense} accentColor="red" symbol={symbol.CASH} />
            {/* Allow user to customize which asset balances appear here? less may have to be shown on smaller screens*/}
            <IndexCard title="Stock" amount={stock} accentColor="blue" symbol={symbol.CASH} />
            <IndexCard title="Crypto" amount={crypto} accentColor="orange" symbol={symbol.CRYPTO}/>
        </div>
    );
};

export default IncomeExpense;