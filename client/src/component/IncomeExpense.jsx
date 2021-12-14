import React from "react";

const IncomeExpense = ({ income, expense }) => {
    return (
        <section className="flex flex-col p-4 bg-gray-100 mx-4 border">

            <div className="relative flex flex-col items-center h-full py-10 bg-white rounded-sm sm:items-stretch sm:flex-row mx-auto">
                <div className="px-12 py-8 md:w-72 ">
                    <h1 className="text-2xl font-bold text-gray-700">Income</h1>
                    <h6 className="text-4xl font-bold text-green-400 sm:text-5xl text-center">
                    $ {income}
                    </h6>
                </div>
                <div className="w-56 h-1 transition duration-300 transform bg-gray-300 rounded-full group-hover:bg-deep-purple-accent-400 group-hover:scale-110 sm:h-auto sm:w-1" />
                <div className="px-12 py-8 md:w-72">
                    <h1 className="text-2xl font-bold text-gray-700">Expense</h1>
                    <h6 className="text-4xl font-bold text-red-400 sm:text-5xl text-center">
                    $ {expense}
                    </h6>              
                </div>
            </div>
            
        </section>
    );
}

export default IncomeExpense;