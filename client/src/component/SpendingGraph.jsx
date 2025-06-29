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
} from "chart.js";
import { Line } from "react-chartjs-2";

import { NotificationType, useNotificationContext } from "./Notification";
import { request } from "../utils/Fetch";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export const options = {
    responsive: true,
    plugins: {
        legend: {
            position: "top",
        },
        title: {
            display: true,
            text: "Spending Graph",
        },
    },
};

// Sunday - Saturday : 0 - 6
const labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


const SpendingGraph = () => {
    const [data, setData] = useState({});

    const { display: displayNotification } = useNotificationContext();

    const getSpendingData = async () => {
        request({
            url: "/api/transactions/all/graph",
            method: "GET",
            callback: ({ msg, success, json }) => {
                if (success) {
                    setData({
                        labels,
                        datasets: [{
                            label: "Expenditure",
                            data: json.spend,
                            borderColor: "rgb(255, 99, 132)",
                            backgroundColor: "rgba(255, 99, 132, 0.5)",
                        },
                        {
                            label: "Income",
                            data: json.income,
                            borderColor: "rgb(53, 162, 235)",
                            backgroundColor: "rgba(53, 162, 235, 0.5)",
                        }],
                    });
                } else {
                    displayNotification({ message: "An error occurred while getting spending graph: " + msg, type: NotificationType.Error });
                }
            }
        });
    };

    useEffect(() => {
        getSpendingData();
    }, []);

    return data?.labels ? (
        <div className="w-full h-full lg:w-1/3 p-2 border-1 border-gray-800 lg:rounded-lg">
            <Line options={options} data={data} />
        </div>
    ): <></>;
};


export default SpendingGraph;
