'use client'

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const BarGraph = ({ userAnalysis }) => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Destroy previous chart (important!)
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        chartRef.current = new Chart(canvasRef.current, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [
                    {
                        label: ' New Users ',
                        data: [0],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(255, 159, 64, 0.6)',
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(255, 159, 64, 0.6)',
                            'rgba(255, 205, 86, 0.6)',
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(255, 159, 64, 0.6)',
                            'rgba(153, 102, 255, 0.6)',
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(201, 203, 207, 0.6)',
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(75, 192, 192, 0.6)',
                        ],
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        suggestedMax: 8,
                        ticks: {
                            stepSize: 1
                        }
                    },
                },
                plugins: {
                    legend: false
                }
            },
        });

        return () => {
            chartRef.current?.destroy();
        };
    }, []);

    useEffect(() => {
        if (!chartRef.current || !userAnalysis) return;

        const data = [];
        const currentMonth = new Date().getMonth();

        chartRef.current.data.labels.forEach((month, index) => {
            if (index <= currentMonth) data.push(userAnalysis[month] ?? 0)
        });

        chartRef.current.data.datasets[0].data = data;

        chartRef.current.update();
    }, [userAnalysis]);

    return (
        <canvas ref={canvasRef} className="w-full z-10 max-h-56"></canvas>
    );
};

export default BarGraph;