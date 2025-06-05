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

    const getSpendingData = async () => {
        const res = await fetch("/api/transactions/all/graph", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (res.status !== 200)
            alert("Error");
        else {
            const graphData = await res.json();
            setData({
                labels,
                datasets: [{
                    label: "Expenditure",
                    data: graphData.spend,
                    borderColor: "rgb(255, 99, 132)",
                    backgroundColor: "rgba(255, 99, 132, 0.5)",
                },
                {
                    label: "Income",
                    data: graphData.income,
                    borderColor: "rgb(53, 162, 235)",
                    backgroundColor: "rgba(53, 162, 235, 0.5)",
                },
                ],
            });
        }
    };

    useEffect(() => {
        getSpendingData();
    }, []);

    return data?.labels ? <Line options={options} data={data} /> : <></>;
}


export default SpendingGraph;
