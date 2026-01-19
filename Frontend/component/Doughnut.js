'use client'
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const Doughnut = ({ labels, data, bg, total }) => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        const ctx = canvasRef.current.getContext("2d");

        chartRef.current = new Chart(ctx, {
            type: "doughnut",
            data: {
                datasets: [{
                    borderRadius: 4,
                    offset: 10,
                    borderWidth: 0,
                    hoverOffset: 20
                }]
            },
            options: {
                animation: {
                    duration: 1200,
                    easing: 'easeOutQuart'
                },
                layout: {
                    padding: 20   // increase based on hoverOffset
                },
                plugins: {
                    tooltip: {
                        enabled: false
                    },
                    legend: {
                        display: false
                    }
                },
            }
        });

        // Cleanup on unmount
        return () => chartRef.current.destroy();
    }, []);

    useEffect(() => {
        if (!chartRef.current) return;

        if (total !== 0) {
            chartRef.current.data.labels = labels;
            chartRef.current.data.datasets[0].label = [' Out of Total '];
            chartRef.current.data.datasets[0].data = data;
            chartRef.current.data.datasets[0].backgroundColor = bg;
            
            chartRef.current.options.plugins.tooltip.enabled = true
        } else {
            chartRef.current.data.datasets[0].backgroundColor = 'Gray';
            chartRef.current.data.datasets[0].data = [1];
        }

        chartRef.current.update();
    }, [data, total]);

    return (
        <canvas ref={canvasRef} className="w-full z-10"></canvas>
    );
};

export default Doughnut;