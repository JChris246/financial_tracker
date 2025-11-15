import { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

import { NotificationType, useNotificationContext } from "./Notification";
import { request } from "../utils/Fetch";
import { formatDate, DATE_TYPE } from "../utils/utils";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const YEAR = 1000 * 60 * 60 * 24 * 365;

const options = {
    responsive: true,
    plugins: {
        legend: {
            display: false
        },
        title: {
            display: false
        },
    },
    scales: {
        x: {
            grid: {
                color: "rgba(255, 255, 255, 0.1)"
            },
            ticks: {
                color: "#94a3b8"
            }
        },
        y: {
            grid: {
                color: "rgba(255, 255, 255, 0.1)"
            },
            ticks: {
                color: "#94a3b8",
                callback: function(value) {
                    return "$" + (value / 1000) + "k";
                }
            }
        }
    }
};

const PerformanceGraph = () => {
    const [data, setData] = useState({});
    const [monthly, setMonthly] = useState(true);
    const [daily, setDaily] = useState(true);
    const [activeStats, setActiveStats] = useState("monthly");

    const { display: displayNotification } = useNotificationContext();

    const getBalanceData = async () => {
        const to = new Date();
        const from =  new Date(to.getTime() - YEAR);

        request({
            url: `/api/balance/performance/${formatDate(from, DATE_TYPE.DISPLAY_DATE)}/${formatDate(to, DATE_TYPE.DISPLAY_DATE)}`,
            method: "GET",
            callback: ({ msg, success, json }) => {
                if (success) {
                    const currentMonth = new Date().toDateString().slice(4, 7);
                    const currentYear = new Date().getFullYear().toString();
                    setMonthly(json.monthlyPerformance);
                    setDaily(json.dailyPerformance.filter(d => d.date.split(" ")[1] === currentMonth && d.date.split(" ")[3] === currentYear));
                } else {
                    displayNotification({ message: "An error occurred while getting balance graph: " + msg, type: NotificationType.Error });
                }
            }
        });
    };

    useEffect(() => {
        const useStats = activeStats === "monthly" ? monthly : daily;
        if (!useStats || !useStats.length) return;

        // TODO: add UI for when there is not enough data

        const color = useStats[0].balance > useStats.slice(-1)[0].balance ? "rgb(255, 99, 132)" : "rgb(34, 197, 94)";
        const backColor = useStats[0].balance > useStats.slice(-1)[0].balance ? "rgba(255, 99, 132, 0.1)" : "rgba(34, 197, 94, 0.1)";

        setData({
            labels: useStats.map(d => d.month || d.date),
            datasets: [{
                label: "Performance",
                data: useStats.map(d => d.balance),
                borderColor: color,
                backgroundColor: backColor,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: color,
            }],
        });
    }, [monthly, daily, activeStats]);

    useEffect(() => {
        getBalanceData();
    }, []);

    return data?.labels ? (
        <div className="w-full h-full lg:w-1/2 p-2 border-1 border-gray-700 bg-gray-800 rounded-lg">
            <div className="flex justify-between">
                <span className="text-xl text-gray-200 font-bold">Performance</span>
                <div className="space-x-2">
                    <button className={"text-gray-100 px-4 py-2 rounded-lg bg-gray-600 " + (activeStats === "monthly" ? " bg-sky-500" : "")}
                        onClick={() => setActiveStats("monthly")}>Monthly</button>
                    <button onClick={() => setActiveStats("daily")}
                        className={"text-gray-100 px-4 py-2 rounded-lg bg-gray-600 " + (activeStats === "daily" ? " bg-sky-500" : "")}>Daily</button>
                </div>
            </div>
            <Line options={options} data={data} />
        </div>
    ): <></>;
};


export default PerformanceGraph;
