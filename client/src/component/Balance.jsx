import { useEffect, useState } from "react";

import { NotificationType, useNotificationContext } from "./Notification";
import { request } from "../utils/Fetch";

const Balance = ({ sync }) => {
    const [balance, setBalance] = useState(0);

    const { display: displayNotification } = useNotificationContext();

    useEffect(() => {
        request({
            url: "/api/balance",
            method: "GET",
            callback: ({ msg, success, json }) => {
                if (success) {
                    // get the balance from the response json
                    const { balance : b } = json;
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

        <section id="balance" className="flex flex-col p-2 mx-4 text-gray-100 bg-gray-700 ">
            <div className="relative flex flex-col h-full py-3 mx-auto sm:items-stretch sm:flex-row md:w-100">
                <div className="px-12 py-8 ">
                    <div className="mb-2 text-lg text-center uppercase">Your Balance</div>
                    <span className="text-3xl">$ { balance } </span>
                </div>
            </div>
        </section>

    );
}

export default Balance;
