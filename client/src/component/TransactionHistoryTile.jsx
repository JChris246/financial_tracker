import React from "react";
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/solid'

const TransactionHistoryTile = ({ item }) => {
    return (
        <div class="flex items-center p-2 bg-white border max:w-96 md:w-96 rounded my-1">
                {item.amount > 0 ?
                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-green-200 rounded">
                        <ArrowUpIcon className="w-5 h-5 text-green-700 fill-current"/>
                    </div>
                    :
                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-red-200 rounded">
                        <ArrowDownIcon className="w-5 h-5 text-red-700 fill-current"/>
                    </div>  
                }
                
                <div className="flex flex-col flex-grow ml-4">
                    {/*<span className="text-xl font-bold">${item.amount}</span>*/}
                    <div className="flex items-center justify-between">
                        <span className="">${item.amount}</span>
                        <span className="pl-1 text-gray-500">{item.name}</span>
                    </div>
                </div>
            </div>
    );
}

export default TransactionHistoryTile;
