import React, { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const options = {
    responsive: true,
    plugins: {
        legend: {
            position: "bottom",
        },
        title: {
            display: true,
            text: "Spending",
        },
    },
};

// const options = {
//     title: {
//         display: true,
//         text: "Spending"
//     },
//     legend: {
//         display: true,
//         position: "bottom"
//     }
// }


const data = {
    labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    datasets: [{
        label: 'Spending',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
    }]
};

const SpendingGraph = () => {
    const [spendingData, setSpendingData] = useState([]);

    useEffect(() => {
        setSpendingData(data);
    }, []);

    return (
        <Line options={options} data={spendingData} />
    );
}

export default SpendingGraph;
