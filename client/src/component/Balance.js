import React, { useEffect, useState } from "react";

const Balance = () => {
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/balance", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            // if status comes back as an error
            // set balance as - for now
            if (res.status !== 200)
                setBalance("-");
            else {
                // else get the balance from the response json
                const { balance : b } = await res.json();
                setBalance(b);
            }
        })();
    }, []);

    return (

        <section className="flex flex-col p-2 bg-gray-700 text-gray-100 mx-4 border rounded-md border-b-0">
            <div className="relative flex flex-col h-full py-3 rounded-sm sm:items-stretch sm:flex-row md:w-100 mx-auto">
                <div className="px-12 py-8 ">
                    <div className="uppercase text-lg text-center">Your Balance</div>
                    <span className="text-3xl">$ { balance } </span>
                </div>
            </div>
        </section>
        
    );
}

export default Balance;
