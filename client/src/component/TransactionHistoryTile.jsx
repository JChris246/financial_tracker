import React from "react";
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/solid'

const TransactionHistoryTile = ({ item }) => {
    const formatDate = (d) => {
		const pad = (v, n=2) => {
			v = v + ""; // convert to string
			if (v.length === n)
				return v;
			for (let i = 0; i < n; i++) {
				v = "0" + v;
				if (v.length >= n)
					break;
			}
			return v;
		};
		
		// YYYY-MM-DDThh:mm
        d = new Date(d);
		const date = d.getFullYear() + "-" + pad(d.getMonth()+1) + "-" + pad(d.getDate());
		const time = pad(d.getHours() - 12) + ":" + pad(d.getMinutes());
		return date + " " + time;
	};

    return (
        <div className="flex items-center p-2 my-1 bg-white border rounded max:w-96 md:w-96">
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
                        <span className= "hidden text-gray-500 sm:block sm:pl-1">{formatDate(item.date)}</span>
                    </div>
                </div>
            </div>
    );
}

export default TransactionHistoryTile;
