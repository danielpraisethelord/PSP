import jsPDF from 'jspdf';
import 'jspdf-autotable';
import domtoimage from 'dom-to-image-more';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const parseDateTime = (dateTimeString) => {
  const [time, modifier] = dateTimeString.split(' ');
  let [hours, minutes, seconds] = time.split(':');
  if (modifier === 'p.m.' && hours !== '12') {
    hours = parseInt(hours, 10) + 12;
  }
  if (modifier === 'a.m.' && hours === '12') {
    hours = '00';
  }
  return new Date(`1970-01-01T${hours}:${minutes}:${seconds}`);
};

export const exportToPdf = async (projectTitle, activities, graphRef) => {
  const doc = new jsPDF();

  // Título del PDF
  doc.setFontSize(18);
  doc.text(`Informe del Proyecto: ${projectTitle}`, 10, 10);

  // Datos del proyecto en formato de tabla
  const projectTableData = [
    ['Nombre del Proyecto', projectTitle],
    ['Total de Actividades', activities.length],
  ];

  // Datos de las actividades en formato de tabla
  const activitiesTableData = activities.map((activity) => {
    const startDate = parseDateTime(activity.startTimes[0]);
    const endDate = parseDateTime(activity.endTimes[activity.endTimes.length - 1]);
    const comments = activity.comments.map(comment => comment.text).join(', ');
    const interruption = activity.totalPauseTime;
    const time = activity.time;
    const timesStarted = activity.startTimes.length;

    return [
      activity.name,
      new Date().toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }), // Usar la fecha actual
      startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      interruption.toFixed(2),
      time.toFixed(2),
      comments,
      timesStarted,
    ];
  });

  // Crear la tabla de actividades
  doc.autoTable({
    startY: 20,
    head: [['Actividad', 'Fecha', 'Hora Inicio', 'Hora Final', 'Interrupción', 'Tiempo', 'Comentarios', 'Veces Iniciada']],
    body: activitiesTableData,
    theme: 'grid',
  });

  // Crear un gráfico de barras con el tiempo total por actividad
  const aggregatedActivities = activities.reduce((acc, curr) => {
    const key = curr.name;
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += curr.time;
    return acc;
  }, {});

  const canvas = document.createElement('canvas');
  canvas.width = 800; // Aumentar el tamaño del canvas para mejorar la calidad
  canvas.height = 400;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(aggregatedActivities),
      datasets: [
        {
          label: 'Tiempo en segundos',
          data: Object.values(aggregatedActivities),
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
          borderRadius: 15,
          hoverBackgroundColor: 'rgba(255, 99, 132, 0.6)',
          hoverBorderColor: 'rgba(255, 99, 132, 1)',
          hoverBorderWidth: 3,
          shadowOffsetX: 4,
          shadowOffsetY: 4,
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: 'black',
          },
        },
        title: {
          display: true,
          text: 'Gráfico de Actividades',
          color: 'black',
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          titleColor: 'black',
          bodyColor: 'black',
        },
      },
      scales: {
        x: {
          ticks: {
            color: 'black',
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.2)',
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: 'black',
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
  });

  // Esperar a que la gráfica se renderice
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Capturar la gráfica como imagen usando domtoimage
  const chartImage = await domtoimage.toPng(canvas, { quality: 1, scale: 2 });

  // Agregar la gráfica al PDF
  const imgWidth = 180;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  doc.addImage(chartImage, 'PNG', 10, doc.autoTable.previous.finalY + 10, imgWidth, imgHeight);

  // Guardar el PDF
  doc.save(`informe_proyecto_${projectTitle}.pdf`);

  // Limpiar el canvas temporal
  document.body.removeChild(canvas);
};