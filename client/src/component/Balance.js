import React from "react";

const Balance = ({ balance }) => {
    return (
        <section className="flex flex-col p-4 bg-white">
            <span className="uppercase text-lg">Your Balance</span>
            <span className="text-3xl">{ balance } </span>
        </section>
    );
}

export default Balance;
