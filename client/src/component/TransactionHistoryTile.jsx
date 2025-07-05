import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/solid";

import { formatDate, DATE_TYPE, formatMoney } from "../utils/utils";
import { symbol } from "../utils/constants";

const TransactionHistoryTile = ({ item, index }) => {
    return (
        <div className="flex items-center p-2 my-1 bg-gray-700 border rounded max:w-96 md:w-96">
            {item.amount > 0 ?
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-green-600 rounded">
                    <ArrowUpIcon className="w-5 h-5 text-green-200 fill-current" />
                </div>
                :
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-red-600 rounded">
                    <ArrowDownIcon className="w-5 h-5 text-red-200 fill-current" />
                </div>
            }

            <div className="flex flex-col flex-grow ml-4">
                {/*<span className="text-xl font-bold">${item.amount}</span>*/}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="pl-1 text-white font-semibold">{item.name}</span>
                        <span className="text-gray-400 text-sm">{formatDate(item.date, DATE_TYPE.DISPLAY_DATE)}</span>
                    </div>
                    <span id={"transaction-history-amount-" + index}
                        className={"font-semibold" + (item.amount > 0 ? " text-green-600" : " text-red-600")}>
                        {item.amount > 0 ? "+" : "-"} {symbol[item.assetType ?? "CASH"]}{formatMoney(Math.abs(item.amount))}</span>
                </div>
            </div>
        </div>
    );
};

export default TransactionHistoryTile;
