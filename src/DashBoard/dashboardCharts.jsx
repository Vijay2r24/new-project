import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const DashboardCharts = () => {
  // --- Total Tenants Chart Data ---
  const tenantData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        label: "Daily Active Users",
        data: [420, 580, 520, 610, 490, 380],
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "#8b5cf6"); // Purple
          gradient.addColorStop(1, "#c4b5fd"); // Light purple
          return gradient;
        },
        barThickness: 18,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: { color: "#374151", font: { size: 13, weight: "600" } },
      },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#000",
        bodyColor: "#000",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 10,
        displayColors: false,
      },
    },
    scales: {
      x: { ticks: { color: "#6b7280" }, grid: { display: false } },
      y: { ticks: { color: "#6b7280" }, grid: { color: "#e5e7eb" } },
    },
    animation: { duration: 1200, easing: "easeInOutQuart" },
  };

  // --- Revenue Chart Data ---
  const revenueData = {
    labels: ["1", "5", "10", "15", "20", "25"],
    datasets: [
      {
        label: "Bronze",
        data: [2000, 3000, 3800, 4500, 5000, 6200],
        backgroundColor: "#cd7f32",
        // borderRadius: 10,
        barPercentage: 0.25,
        categoryPercentage: 0.45,
        barThickness: 10,

      },
      {
        label: "Silver",
        data: [3500, 4500, 5200, 6000, 6800, 7500],
        backgroundColor: "#c0c0c0",
        // borderRadius: 10,
        barPercentage: 0.25,
        categoryPercentage: 0.45,
        barThickness: 10,
      },
      {
        label: "Gold",
        data: [5000, 6500, 7200, 9000, 10000, 12000],
        backgroundColor: "#ffd700",
        // borderRadius: 10,
        barPercentage: 0.25,
        categoryPercentage: 0.45,

        barThickness: 10,
      },
    ],
  };

  const revenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#374151", font: { size: 13, weight: "600" } },
      },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#000",
        bodyColor: "#000",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 10,
        displayColors: true,
      },
    },
    scales: {
      x: { ticks: { color: "#6b7280" }, grid: { display: false } },
      y: { ticks: { color: "#6b7280" }, grid: { color: "#e5e7eb" } },
    },
    animation: { duration: 1200, easing: "easeInOutQuart" },
  };




  return (
    <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1 mt-10">
      {/* TOTAL TENANTS CHART */}
      <div className="bg-white p-5 rounded-2xl border  w-[610px] h-[350px] -ml-0 hover:shadow-2xl transition-all duration-300">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Application Usage Overview
        </h2>

        <div className="h-[260px]">
          <Bar data={tenantData} options={chartOptions} />
        </div>
      </div>

      {/* REVENUE CHART */}
      {/* <div className="bg-white p-5 rounded-2xl border shadow-xl w-[550px] h-[350px] hover:shadow-2xl transition-all duration-300">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">
          Revenue Chart - Subscription Plans
        </h2>

        <div className="h-[260px]">
          <Bar data={revenueData} options={revenueOptions} />
        </div>
      </div> */}
    </div>
  );
};

export default DashboardCharts;
