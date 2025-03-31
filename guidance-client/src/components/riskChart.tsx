"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { Cluster } from "@/models/cluster";

interface RiskChartProps {
  clusters: Cluster[];
}

export default function RiskChart({ clusters }: RiskChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const total = clusters.reduce((sum, cluster) => sum + cluster.count, 0);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Destroy previous chart instance if it exists
    Chart.getChart(ctx)?.destroy();

    const total = clusters.reduce((sum, cluster) => sum + cluster.count, 0);
    const data = clusters.map((cluster) => (cluster.count / total) * 100);
    const labels = clusters.map((cluster) => cluster.name);
    const backgroundColors = clusters.map((cluster) => `#${cluster.color}`);

    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: backgroundColors,
            borderWidth: 0,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false, // Hides the top legend
          },
        },
        cutout: "55%", // Adjust the hole size for a better look
      },
    });
  }, [clusters]);

  return (
    <div className="bg-white rounded-lg shadow-md py-8 px-11 w-fit h-full max-w-2xl flex flex-col md:flex-row items-center">
      <div className="w-64 h-64 relative z-0">
        <canvas ref={chartRef}></canvas>
      </div>
      <div className="md:ml-12 mt-6 md:mt-0">
        <h2 className="text-3xl font-bold text-gray-600 mb-6">Overall Result</h2>
        <div className="space-y-4">
          {clusters.map((cluster) => (
            <div key={cluster.name} className="flex items-center">
              <span className={`w-4 h-4 rounded-full mr-3`} style={{ backgroundColor: `#${cluster.color}` }}></span>
              <span className="text-sm text-gray-600">{`${cluster.name} (${((cluster.count / total) * 100).toFixed(2)}%)`}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

