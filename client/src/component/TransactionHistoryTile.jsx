import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/solid";

import { formatDate, DATE_TYPE, formatMoney } from "../utils/utils";
import { symbol } from "../utils/constants";
import { MAX_TRANSACTION_ITEMS } from "./TransactionHistoryGlance";

const TransactionHistoryTile = ({ item, index }) => {
    const border = "border-b-1 border-gray-700";
    return (
        <div className={"flex items-center px-2 py-5 my-1 w-full " + (index !== MAX_TRANSACTION_ITEMS - 1 ? border : "")}>
            {item.amount > 0 ?
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-green-600/20 rounded">
                    <ArrowUpIcon className="w-5 h-5 text-green-400 fill-current" />
                </div>
                :
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-red-600/20 rounded">
                    <ArrowDownIcon className="w-5 h-5 text-red-400 fill-current" />
                </div>
            }

            <div className="flex flex-col flex-grow ml-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-white">{item.name}</span>
                        <span className="text-gray-400 text-xs">{formatDate(item.date, DATE_TYPE.DISPLAY_DATE)}</span>
                    </div>
                    <span id={"transaction-history-amount-" + index}
                        className={"text-nowrap " + (item.amount > 0 ? "text-green-600" : "text-red-600")}>
                        {item.amount > 0 ? "+" : "-"} {symbol[item.assetType ?? "CASH"]}{formatMoney(Math.abs(item.amount))}</span>
                </div>
            </div>
        </div>
    );
};

export default TransactionHistoryTile;
