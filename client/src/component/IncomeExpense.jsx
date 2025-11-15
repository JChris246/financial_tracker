import { symbol } from "../utils/constants";
import { formatMoney } from "../utils/utils";

import { useAppContext } from "../AppContext";
import { TrendingDownIcon, TrendingUpIcon } from "@heroicons/react/solid";

// TODO: rename this?
const IndexCard = ({ title, amount, accentColor, symbol, children: icon }) => {
    return (
        <div id={title} className={"border-1 border-l-8 border-gray-700 bg-gray-800 rounded-xl pl-4 pr-6 py-4 h-fit " + accentColor + "-accent"}
            title={title + " value in usd"}>
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-md text-gray-400 mb-2 block">{title}</span>
                    <span id={title + "-value"} className={"font-bold text-2xl xl:text-3xl mb-1 " + accentColor + "-text-accent"}>
                        {symbol} {typeof(amount) === "number" ? formatMoney(Math.abs(amount)) : amount}
                    </span>
                </div>
                <div className={"w-12 h-12 rounded-lg flex items-center justify-center " + accentColor + "-bg-accent"}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

const IncomeExpense = () => {
    const { balance } = useAppContext();
    const { totalIncome: income, totalSpend: expense, totalStock: stock, totalCrypto: crypto } = balance;

    return (
        <div id="incomeexpense" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mx-auto my-8 rounded-sm px-4 max-w-7xl">
            <IndexCard title="Income" amount={income} accentColor="green" symbol={symbol.CASH}>
                <TrendingUpIcon className={"w-6 h-6 green-text-accent"}/>
            </IndexCard>
            <IndexCard title="Expense" amount={expense} accentColor="red" symbol={symbol.CASH}>
                <TrendingDownIcon className={"w-6 h-6 red-text-accent"}/>
            </IndexCard>
            {/* Allow user to customize which asset balances appear here? less may have to be shown on smaller screens*/}
            {/* revisit the use of font-awesome icons here */}
            <IndexCard title="Stock" amount={stock} accentColor="blue" symbol={symbol.CASH}>
                <i className="fas fa-chart-line blue-text-accent text-lg"></i>
            </IndexCard>
            <IndexCard title="Crypto" amount={crypto} accentColor="orange" symbol={symbol.CRYPTO}>
                <i className="fab fa-bitcoin orange-text-accent text-lg"></i>
            </IndexCard>
        </div>
    );
};

export default IncomeExpense;