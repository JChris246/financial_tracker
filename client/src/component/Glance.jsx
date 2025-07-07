import { useEffect, useState } from "react";

import { NotificationType, useNotificationContext } from "./Notification";
import { request } from "../utils/Fetch";
import { formatMoney } from "../utils/utils";

const atAGlanceParams = {
    stock: {
        title: "Stocks",
        api: "/api/price/stock",
        color: "blue"
    },
    crypto: {
        title: "Crypto",
        api: "/api/price/crypto",
        color: "blue"
    }
};

const Glance = ({ type }) => {
    const { display: displayNotification } = useNotificationContext();
    const [prices, setPrices] = useState({});

    useEffect(() => {
        // TODO: make this request 1x and store in context
        request({
            url: atAGlanceParams[type].api,
            method: "GET",
            callback: ({ msg, success, json }) => {
                if (success) {
                    setPrices(json);
                } else {
                    displayNotification({ message: "Unable to get " + type + " prices: " + msg, type: NotificationType.Error });
                }
            }
        });
    }, [type]);

    return (
        <div className={"w-full lg:w-1/4 border-2 border-gray-600 rounded-md p-4 py-2 h-fit m-2 space-y-2 "}>
            <h1 className="text-2xl text-gray-200 mb-8 rounded underline-decoration">{atAGlanceParams[type].title}</h1>
            {
                Object.keys(prices).map((key) => {
                    return (
                        <div key={key} className="flex justify-between">
                            <span className="text-4xl font-bold text-xl mb-1 text-gray-100">{key}</span>
                            <span className="text-4xl text-xl mb-1 text-gray-100">${formatMoney(prices[key])}</span>
                        </div>
                    );
                })
            }
        </div>
    );
};

export default Glance;