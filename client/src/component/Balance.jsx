import { formatMoney } from "../utils/utils";
import { AddTransaction } from "./AddTransaction";

import { useAppContext } from "../AppContext";

const Balance = ({ refresh }) => {
    const { balance } = useAppContext();

    return (
        <section id="balance" className="flex flex-col md:flex-row p-2 mx-auto text-gray-100 bg-gray-800 rounded-md w-3/4">
            <div>
                <div className="flex flex-col p-6">
                    <div className="mb-2 uppercase text-gray-400">Your Balance</div>
                    <span id="balance-value" className="text-4xl font-semibold">$ { formatMoney(balance.balance) } </span>
                </div>
                <AddTransaction refresh={refresh} />
            </div>
        </section>

    );
};

export default Balance;
