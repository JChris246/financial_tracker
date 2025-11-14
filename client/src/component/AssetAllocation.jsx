import { useEffect, useState } from "react";

import { useProgressColor } from "../utils/useProgressColor";
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
        maintainAspectRatio: false,
        plugins: {
            labels: {
                padding: 20,
                usePointStyle: true
            },
            legend: {
                position: "bottom",
                labels: {
                    color: "#e2e8f0",
                    padding: 20,
                    usePointStyle: true
                }
            },
            title: {
                display: false,
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

const AssetAllocation = () => {
    const { balance } = useAppContext();
    const [assetAllocationData, setAssetAllocationData] = useState({
        labels: ["None"],
        datasets: [{
            data: [300],
            backgroundColor: ["rgb(255, 99, 132)"],
        }]
    });
    const [/*cryptoAllocationData*/, setCryptoAllocationData] = useState({
        labels: ["None"],
        datasets: [{
            data: [300],
            backgroundColor: ["rgb(255, 99, 132)"],
        }]
    });
    const [/*stockAllocationData*/, setStockAllocationData] = useState({
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
                    backgroundColor: colors,
                    borderWidth: 0,
                    cutout: "70%"
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
                    backgroundColor: cryptoColors,
                    borderWidth: 0,
                    cutout: "70%"
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
                    backgroundColor: stockColors,
                    borderWidth: 0,
                    cutout: "70%"
                }],
                // These labels appear in the legend and in the tooltips when hovering different arcs
                labels: stockLabels
            });
        }
    }, [balance]);

    return (
        <div className="mx-auto w-full lg:w-1/3 bg-gray-800 rounded-lg p-4 border-1 border-gray-700">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">Asset Allocation</h3>
            <div className="flex flex-col lg:flex-row justify-center items-center lg:justify-between lg:mx-0 p-4 h-[300px]">
                <Doughnut options={getOptions("Asset Allocation")} data={assetAllocationData}/>
                {/* TODO: I need to relocate these, putting them here was for POC */}
                {/* <Doughnut options={getOptions("Crypto Allocation")} data={cryptoAllocationData}/>
                <Doughnut options={getOptions("Stock Allocation")} data={stockAllocationData}/> */}
            </div>
        </div>
    );
};

export default AssetAllocation;
