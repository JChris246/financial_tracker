import { useEffect, useState } from "react";

import { formatMoney } from "../utils/utils";
import { useProgressColor } from "../utils/useProgressColor";
import { AddTransaction } from "./AddTransaction";

import { useAppContext } from "../AppContext";

import {
    Chart as ChartJS,
    ArcElement
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(
    ArcElement
);

const getOptions = title => (
    {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: title,
            },
        },
    }
);

const prepareGraphData = (assetMap, keyValue) => {
    const data = [];
    const labels = [];
    const colors = [];
    Object.keys(assetMap).forEach((key) => {
        data.push(assetMap[key][keyValue]);
        labels.push(key);
        // TODO: use useProgressColor for now until I find a good way to generate colors
        colors.push(useProgressColor(assetMap[key][keyValue] * 100));
    });

    return { data, labels, colors };
};

const Balance = ({ refresh }) => {
    const { balance } = useAppContext();
    const [assetAllocationData, setAssetAllocationData] = useState({
        labels: ["None"],
        datasets: [{
            data: [300],
            backgroundColor: ["rgb(255, 99, 132)"],
        }]
    });
    const [cryptoAllocationData, setCryptoAllocationData] = useState({
        labels: ["None"],
        datasets: [{
            data: [300],
            backgroundColor: ["rgb(255, 99, 132)"],
        }]
    });
    const [stockAllocationData, setStockAllocationData] = useState({
        labels: ["None"],
        datasets: [{
            data: [300],
            backgroundColor: ["rgb(255, 99, 132)"],
        }]
    });

    useEffect(() => {
        const data = [];
        const labels = [];
        const colors = [];
        const { crypto, stock, cash } = balance;
        [crypto, stock, cash].forEach((assetType) => {
            const { data: assetData, labels: assetLabels, colors: assetColors } = prepareGraphData(assetType, "allocation");
            data.push(...assetData);
            labels.push(...assetLabels);
            colors.push(...assetColors);
        });

        if (data.length > 0) {
            setAssetAllocationData({
                datasets: [{
                    label: "Asset Allocation",
                    data: data,
                    backgroundColor: colors
                }],
                // These labels appear in the legend and in the tooltips when hovering different arcs
                labels
            });
        }

        const { data: cryptoData, labels: cryptoLabels, colors: cryptoColors } = prepareGraphData(crypto, "assetAllocation");
        if (cryptoData.length > 0) {
            setCryptoAllocationData({
                datasets: [{
                    label: "Crypto Allocation",
                    data: cryptoData,
                    backgroundColor: cryptoColors
                }],
                // These labels appear in the legend and in the tooltips when hovering different arcs
                labels: cryptoLabels
            });
        }

        const { data: stockData, labels: stockLabels, colors: stockColors } = prepareGraphData(stock, "assetAllocation");
        if (stockData.length > 0) {
            setStockAllocationData({
                datasets: [{
                    label: "Stock Allocation",
                    data: stockData,
                    backgroundColor: stockColors
                }],
                // These labels appear in the legend and in the tooltips when hovering different arcs
                labels: stockLabels
            });
        }
    }, [balance]);

    return (

        <section id="balance" className="flex flex-col md:flex-row p-2 mx-auto text-gray-100 bg-gray-800 rounded-md w-3/4">
            <div>
                <div className="flex flex-col p-6">
                    <div className="mb-2 uppercase">Your Balance</div>
                    <span id="balance-value" className="text-4xl font-semibold">$ { formatMoney(balance.balance) } </span>
                </div>
                <AddTransaction refresh={refresh} />
            </div>

            <div className="flex flex-col lg:flex-row justify-center lg:justify-between mx-auto lg:mx-0 w-3/4 lg:w-2/4 p-4 h-fit lg:h-75">
                <Doughnut options={getOptions("Asset Allocation")} data={assetAllocationData}/>
                {/* TODO: I need to relocate these, putting them here was for POC */}
                <Doughnut options={getOptions("Crypto Allocation")} data={cryptoAllocationData}/>
                <Doughnut options={getOptions("Stock Allocation")} data={stockAllocationData}/>
            </div>
        </section>

    );
};

export default Balance;
