import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function AttendanceChart({ data }) {
  // Process data to create chart labels and values
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Present',
        data: [12, 19, 15, 17, 14, 8],
        backgroundColor: '#4361ee',
      },
      {
        label: 'Absent',
        data: [3, 2, 1, 4, 2, 5],
        backgroundColor: '#f72585',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="chart-container" style={{ height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default AttendanceChart;