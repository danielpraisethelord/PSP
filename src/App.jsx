import { useState, useEffect } from 'react';
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
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css'; // Asegúrate de importar el archivo CSS de Tailwind

// Registra los componentes necesarios de chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

Modal.setAppElement('#root');

function App() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [activity, setActivity] = useState('');
  const [activities, setActivities] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActivitiesModalOpen, setIsActivitiesModalOpen] = useState(false);
  const [isActivityInputModalOpen, setIsActivityInputModalOpen] = useState(false);
  const [audio, setAudio] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [newActivityName, setNewActivityName] = useState('');
  const [pauseStartTime, setPauseStartTime] = useState(null);
  const [totalPauseTime, setTotalPauseTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!isRunning && time !== 0) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRunning, time]);

  useEffect(() => {
    if (time === 60) {
      const audioInstance = new Audio('/alert.mp3');
      setAudio(audioInstance);
      audioInstance.play();
      setIsModalOpen(true);
    }
  }, [time]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ''; // Algunos navegadores requieren esta línea para mostrar el mensaje de confirmación
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const fetchLocalTime = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();

        if (!data.utc_offset) {
          throw new Error("No se pudo obtener la zona horaria.");
        }

        const offsetMatch = data.utc_offset.match(/([+-])(\d{2}):(\d{2})/);
        if (!offsetMatch) {
          throw new Error("Formato de UTC offset inválido.");
        }

        const sign = offsetMatch[1] === "+" ? 1 : -1;
        const offsetHours = parseInt(offsetMatch[2], 10);
        const offsetMinutes = parseInt(offsetMatch[3], 10);
        const totalOffsetMinutes = sign * (offsetHours * 60 + offsetMinutes);

        const utcTime = new Date();
        const localTime = new Date(utcTime.getTime() + totalOffsetMinutes * 60000);
        setCurrentTime(localTime);
      } catch (error) {
        console.error("Error fetching local time:", error);
      }
    };

    fetchLocalTime();

    const timer = setInterval(() => {
      setCurrentTime((prevTime) => new Date(prevTime.getTime() + 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCloseModal = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsModalOpen(false);
  };

  const handleCloseActivitiesModal = () => {
    setIsActivitiesModalOpen(false);
  };

  const handleCloseActivityInputModal = () => {
    setIsActivityInputModalOpen(false);
  };

  const handleStart = () => {
    if (activity) {
      if (pauseStartTime) {
        const pauseEndTime = Date.now();
        const pauseDuration = (pauseEndTime - pauseStartTime) / 1000;
        setTotalPauseTime(totalPauseTime + pauseDuration);
        setPauseStartTime(null); // Restablece el tiempo de inicio de pausa
      }
      setIsRunning(true);
    } else {
      setIsActivityInputModalOpen(true);
    }
  };

  const handleActivityInputSubmit = () => {
    if (newActivityName) {
      setActivity(newActivityName);
      setIsRunning(true);
      setIsActivityInputModalOpen(false);
      setNewActivityName(''); // Restablece el nombre de la nueva actividad
    }
  };

  const handlePause = () => {
    setIsRunning(false);
    setPauseStartTime(Date.now());
  };

  const handleStop = () => {
    if (!isRunning) return;
    const pauseEndTime = Date.now();
    const pauseDuration = pauseStartTime ? (pauseEndTime - pauseStartTime) / 1000 : 0;
    setTotalPauseTime(totalPauseTime + pauseDuration);
    setIsRunning(false);
    setActivities([...activities, { name: activity, time, totalPauseTime: totalPauseTime + pauseDuration }]);
    setTime(0);
    setActivity('');
    setTotalPauseTime(0);
    setPauseStartTime(null); // Restablece el tiempo de inicio de pausa
  };

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
    setIsActivitiesModalOpen(false); // Cierra el modal de "Ver Actividades"
    setIsModalOpen(true); // Abre el modal de "Ver Detalles"
  };

  const validateJson = (json) => {
    if (!Array.isArray(json)) return false;
    for (const activity of json) {
      if (
        typeof activity.name !== 'string' ||
        typeof activity.time !== 'number' ||
        typeof activity.totalPauseTime !== 'number'
      ) {
        return false;
      }
    }
    return true;
  };

  const showAlert = (message) => {
    toast.error(message, {
      position: 'top-right', // Usa la cadena en lugar de una propiedad inexistente
      autoClose: 5000,
    });
  };

  const importFromJson = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const importedActivities = JSON.parse(e.target.result);
        if (validateJson(importedActivities)) {
          setActivities(importedActivities);
        } else {
          showAlert('El archivo JSON no tiene el formato correcto.');
        }
      } catch (error) {
        showAlert('Error al leer el archivo JSON.');
      }
    };

    reader.readAsText(file);
  };

  const exportToJson = () => {
    const dataStr = JSON.stringify(activities, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'actividades.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const data = {
    labels: activities.map((activity) => activity.name),
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
          gradient.addColorStop(0, 'rgba(75, 192, 192, 0.2)');
          gradient.addColorStop(1, 'rgba(75, 192, 192, 0.8)');

          return gradient;
        },
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        borderRadius: 5,
        hoverBackgroundColor: 'rgba(75, 192, 192, 0.6)',
        hoverBorderColor: 'rgba(75, 192, 192, 1)',
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'white', // Color del texto de la leyenda
        },
      },
      title: {
        display: true,
        text: 'Gráfico de Actividades',
        color: 'white', // Color del texto del título
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
          color: 'white', // Color del texto de las etiquetas del eje x
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)', // Color de las líneas de la cuadrícula del eje x
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: 'white', // Color del texto de las etiquetas del eje y
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)', // Color de las líneas de la cuadrícula del eje y
        },
      },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white relative">
      <div className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded-lg shadow-md">
        <span className="text-xl font-bold">
          {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>
      <h1 className="text-4xl font-bold mt-8">Reloj Contador</h1>
      <div className="mt-4 p-4 bg-gray-800 shadow-md rounded-lg">
        <div className="text-2xl mb-4">
          {new Date(time * 1000).toISOString().substr(11, 8)}
        </div>
        <div className="flex space-x-4">
          {!isRunning ? (
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              onClick={handleStart}
            >
              {activity ? 'Reanudar' : 'Iniciar'}
            </button>
          ) : (
            <button
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-700"
              onClick={handlePause}
            >
              Pausar
            </button>
          )}
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
            onClick={handleStop}
          >
            Parar
          </button>
        </div>
      </div>
      <div className="mt-8 w-full max-w-2xl bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Gráfico de Actividades</h2>
        <Bar data={data} options={options} />
      </div>
      <button
        className="mt-8 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        onClick={() => setIsActivitiesModalOpen(true)}
      >
        Ver Actividades
      </button>
      <button
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
        onClick={exportToJson}
      >
        Exportar Actividades
      </button>
      <input
        type="file"
        accept=".json"
        onChange={importFromJson}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      />
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Alerta de Tiempo"
        className="fixed inset-0 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0 bg-opacity-50 backdrop-blur-md"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            {selectedActivity ? selectedActivity.name : '¡Alerta de Tiempo!'}
          </h2>
          <p className="text-gray-900 dark:text-white">
            {selectedActivity
              ? `Tiempo: ${new Date(selectedActivity.time * 1000).toISOString().substr(11, 8)}`
              : '¡La actividad ha superado los 60 segundos!'}
          </p>
          {selectedActivity && (
            <p className="text-gray-900 dark:text-white">
              Tiempo de Pausa: {new Date(selectedActivity.totalPauseTime * 1000).toISOString().substr(11, 8)}
            </p>
          )}
          <button
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
            onClick={handleCloseModal}
          >
            Cerrar
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={isActivitiesModalOpen}
        onRequestClose={handleCloseActivitiesModal}
        contentLabel="Lista de Actividades"
        className="fixed inset-0 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0 bg-opacity-50 backdrop-blur-md"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800 max-w-2xl w-full">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Actividades</h2>
          <ul className="list-disc list-inside text-gray-900 dark:text-white">
            {activities.map((activity, index) => (
              <li key={index} className="mb-2 flex justify-between items-center">
                {activity.name}
                <button
                  className="ml-4 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
                  onClick={() => handleActivityClick(activity)}
                >
                  Ver Detalles
                </button>
              </li>
            ))}
          </ul>
          <button
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
            onClick={handleCloseActivitiesModal}
          >
            Cerrar
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={isActivityInputModalOpen}
        onRequestClose={handleCloseActivityInputModal}
        contentLabel="Ingresar Nombre de Actividad"
        className="fixed inset-0 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0 bg-opacity-50 backdrop-blur-md"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Ingrese el Nombre de la Actividad</h2>
          <input
            type="text"
            className="w-full p-2 mb-4 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
            value={newActivityName}
            onChange={(e) => setNewActivityName(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            onClick={handleActivityInputSubmit}
          >
            Iniciar
          </button>
          <button
            className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
            onClick={handleCloseActivityInputModal}
          >
            Cancelar
          </button>
        </div>
      </Modal>
      <ToastContainer />
    </div>
  );
}

export default App;