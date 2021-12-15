import React from "react";

const TransactionHistoryTile = ({ item }) => {
    const isPositive = () => item.amount > 0;

    return (
        <div class="flex items-center p-4 bg-white border rounded max-w-md min-w-max my-1">
                {isPositive() ?
                    <div class="flex flex-shrink-0 items-center justify-center bg-green-200 h-16 w-16 rounded">
                        <svg class="w-6 h-6 fill-current text-green-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    :
                    <div class="flex flex-shrink-0 items-center justify-center bg-red-200 h-16 w-16 rounded">
                        <svg class="w-6 h-6 fill-current text-red-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                    </div>  
                }
                
                <div class="flex-grow flex flex-col ml-4">
                    {/*<span class="text-xl font-bold">${item.amount}</span>*/}
                    <div class="flex items-center justify-between">
                        <span class="text-xl font-bold">${item.amount}</span>
                        <span class="text-gray-500">{item.name}</span>
                    </div>
                </div>
            </div>
    );
}

export default TransactionHistoryTile;
