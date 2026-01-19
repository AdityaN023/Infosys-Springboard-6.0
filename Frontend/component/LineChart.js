'use client'
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const LineChart = ({ usageStatistics }) => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        chartRef.current = new Chart(canvasRef.current, {
            type: 'line',
            data: {
                labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                datasets: [{
                    label: ' Usage Count ',
                    data: [0],
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
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
            },
        });

        return () => {
            chartRef.current?.destroy();
        };
    }, []);

    useEffect(() => {
        if (!chartRef.current || !usageStatistics) return;

        const currentDay = new Date().getDay();
        const data = []

        chartRef.current.data.labels.forEach((day, index) => {
            if (index <= currentDay) data.push(usageStatistics[day] ?? 0)
        })

        chartRef.current.data.datasets[0].data = data;

        chartRef.current.update();
    }, [usageStatistics]);

    return (
        <canvas ref={canvasRef} className="w-full z-10 max-h-56"></canvas>
    );
};

export default LineChart;