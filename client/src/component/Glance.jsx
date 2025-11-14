import { useEffect, useState } from "react";

import { NotificationType, useNotificationContext } from "./Notification";
import { request } from "../utils/Fetch";
import { formatMoney, stringToColor } from "../utils/utils";

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

const Glance = () => {
    const { display: displayNotification } = useNotificationContext();
    const [prices, setPrices] = useState({
        stock: {}, crypto: {}
    });
    const [type, setType] = useState("stock");

    useEffect(() => {
        // TODO: make this request 1x and store in context
        if (Object.keys(prices[type]).length > 0) {
            return;
        }

        request({
            url: atAGlanceParams[type].api,
            method: "GET",
            callback: ({ msg, success, json }) => {
                if (success) {
                    setPrices({ ...prices, [type]: json });
                } else {
                    displayNotification({ message: "Unable to get " + type + " prices: " + msg, type: NotificationType.Error });
                }
            }
        });
    }, [type]);

    return (
        <div className="w-full lg:w-1/4 border-1 border-gray-700 bg-gray-800 rounded-md p-4 h-fit m-2 space-y-2">
            <div className="flex justify-between">
                <h1 className="text-2xl text-gray-200 font-bold mb-8 rounded underline-decoration">{atAGlanceParams[type].title}</h1>
                <div className="space-x-2">
                    <button onClick={() => setType("stock")} id="stock-asset-button"
                        className={"text-gray-100 px-4 py-2 rounded-lg bg-gray-600 " + (type === "stock" ? " bg-sky-500" : "")}>Stocks</button>
                    <button onClick={() => setType("crypto")} id="crypto-asset-button"
                        className={"text-gray-100 px-4 py-2 rounded-lg bg-gray-600 " + (type === "crypto" ? " bg-sky-500" : "")}>Crypto</button>
                </div>
            </div>
            {
                Object.keys(prices[type]).map((key, i, arr) => {
                    return (
                        <div key={key} className={"flex justify-between py-4 " + (i !== arr.length - 1 ? "border-b-1 border-gray-700": "")}
                            glance-price={key}>
                            <div className="flex items-center space-x-2">
                                <span className="block w-4 h-4 rounded-full" style={{ backgroundColor: stringToColor(key) }}></span>
                                <span className="text-xl text-gray-100">{key}</span>
                            </div>
                            <span className="text-xl text-gray-100">${formatMoney(prices[type][key])}</span>
                        </div>
                    );
                })
            }
        </div>
    );
};

export default Glance;