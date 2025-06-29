import { useEffect, useState } from "react";

import { NotificationType, useNotificationContext } from "./Notification";
import { request } from "../utils/Fetch";
import { AddTrans } from "./AddTrans";

const Balance = ({ sync, refresh }) => {
    const [balance, setBalance] = useState(0);

    const { display: displayNotification } = useNotificationContext();

    useEffect(() => {
        request({
            url: "/api/balance",
            method: "GET",
            callback: ({ msg, success, json }) => {
                if (success) {
                    // get the balance from the response json
                    const { balance: b } = json;
                    setBalance(b);
                } else {
                    // if status comes back as an error
                    // set balance as - for now
                    setBalance("-");
                    displayNotification({ message: "Unable to get balance: " + msg, type: NotificationType.Error });
                }
            }
        });
    }, [sync]);

    return (

        <section id="balance" className="flex flex-col p-2 mx-4 text-gray-100 bg-gray-800 rounded-md w-3/4">
            <div className="flex flex-col p-6">
                <div className="mb-2 uppercase">Your Balance</div>
                <span id="balance-value" className="text-3xl font-semibold">$ { balance } </span>
            </div>
            <AddTrans refresh={refresh} />
        </section>

    );
};

export default Balance;
