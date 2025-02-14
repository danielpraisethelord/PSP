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

const ActivityGraph = ({ activities }) => {
  const totalTimeSum = activities.reduce((acc, activity) => acc + activity.totalTime, 0);

  const data = {
    labels: activities.map((activity) => {
      const percentage = ((activity.totalTime / totalTimeSum) * 100).toFixed(2);
      return `${activity.name} - ${percentage}%`;
    }),
    datasets: [
      {
        label: 'Tiempo en segundos',
        data: activities.map((activity) => activity.time),
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) {
            return null;
          }

          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(255, 99, 132, 0.2)');
          gradient.addColorStop(1, 'rgba(255, 99, 132, 0.8)');

          return gradient;
        },
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        borderRadius: 10,
        hoverBackgroundColor: 'rgba(255, 99, 132, 0.6)',
        hoverBorderColor: 'rgba(255, 99, 132, 1)',
        hoverBorderWidth: 3,
        shadowOffsetX: 3,
        shadowOffsetY: 3,
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'white',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
      title: {
        display: true,
        text: 'Gráfico de Actividades',
        color: 'white',
        font: {
          size: 18,
          weight: 'bold',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'white',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: 'white',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default ActivityGraph;