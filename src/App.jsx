import { useState, useEffect, useRef } from 'react';
import Timer from './components/Timer';
import ActivityGraph from './components/ActivityGraph';
import TimeModal from './components/TimeModal';
import ActivityInputModal from './components/ActivityInputModal';
import ActivitiesModal from './components/ActivitiesModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import { exportToPdf } from './utils/exportToPdf';
import './index.css';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [isProjectTitleModalOpen, setIsProjectTitleModalOpen] = useState(false);
  const graphRef = useRef();

  useEffect(() => {
    if (activities.length === 0) {
      setIsProjectTitleModalOpen(true);
    }
  }, [activities]);

  const handleProjectTitleSubmit = () => {
    setIsProjectTitleModalOpen(false);
  };

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

  const showAlert = (message) => {
    toast.error(message, {
      position: 'top-right',
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

  const handleExportToJson = () => {
    const dataStr = JSON.stringify(activities, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `${projectTitle}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExportToPdf = () => {
    exportToPdf(projectTitle, activities, graphRef);
  };

  const validateJson = (json) => {
    if (!Array.isArray(json)) return false;
    for (const activity of json) {
      if (
        typeof activity.id !== 'number' ||
        typeof activity.name !== 'string' ||
        typeof activity.time !== 'number' ||
        typeof activity.totalPauseTime !== 'number' ||
        typeof activity.totalTime !== 'number' ||
        !Array.isArray(activity.comments)
      ) {
        return false;
      }
    }
    return true;
  };

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
    setIsActivitiesModalOpen(false);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white relative">
      <div className="absolute top-4 left-4">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg shadow-md"
          >
            Menú
          </button>
          {isDropdownOpen && (
            <div className="absolute mt-2 w-48 bg-gray-800 text-white rounded-lg shadow-lg z-50">
              <button
                className="block px-4 py-2 w-full text-left hover:bg-gray-700"
                onClick={() => setIsActivitiesModalOpen(true)}
              >
                Ver Actividades
              </button>
              <button
                className="block px-4 py-2 w-full text-left hover:bg-gray-700"
                onClick={handleExportToJson}
              >
                Exportar Actividades
              </button>
              <button
                className="block px-4 py-2 w-full text-left hover:bg-gray-700"
                onClick={handleExportToPdf}
              >
                Exportar a PDF
              </button>
              <div className="block px-4 py-2 w-full text-left hover:bg-gray-700">
                <label className="cursor-pointer">
                  Seleccionar Archivo
                  <input
                    type="file"
                    accept=".json"
                    onChange={importFromJson}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded-lg shadow-md">
        <span className="text-xl font-bold">
          {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>
      <h1 className="text-4xl font-bold mt-8">Reloj Contador</h1>
      <Timer
        activity={activity}
        setActivity={setActivity}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        time={time}
        setTime={setTime}
        activities={activities}
        setActivities={setActivities}
        isActivityInputModalOpen={isActivityInputModalOpen}
        setIsActivityInputModalOpen={setIsActivityInputModalOpen}
        newActivityName={newActivityName}
        setNewActivityName={setNewActivityName}
        pauseStartTime={pauseStartTime}
        setPauseStartTime={setPauseStartTime}
        totalPauseTime={totalPauseTime}
        setTotalPauseTime={setTotalPauseTime}
        setIsModalOpen={setIsModalOpen}
        setAudio={setAudio}
      />
      <div className="mt-8 w-full max-w-2xl bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6" ref={graphRef}>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Gráfico de Actividades</h2>
        <ActivityGraph activities={activities} />
      </div>
      <TimeModal
        isOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        selectedActivity={selectedActivity}
        audio={audio}
      />
      <ActivitiesModal
        isOpen={isActivitiesModalOpen}
        handleCloseActivitiesModal={handleCloseActivitiesModal}
        activities={activities}
        handleActivityClick={handleActivityClick}
      />
      <ActivityInputModal
        isOpen={isActivityInputModalOpen}
        handleCloseActivityInputModal={handleCloseActivityInputModal}
        handleActivityInputSubmit={() => {
          if (newActivityName) {
            setActivity(newActivityName);
            setIsRunning(true);
            setIsActivityInputModalOpen(false);
            setNewActivityName('');
          }
        }}
        newActivityName={newActivityName}
        setNewActivityName={setNewActivityName}
      />
      <Modal
        isOpen={isProjectTitleModalOpen}
        onRequestClose={() => setIsProjectTitleModalOpen(false)}
        contentLabel="Título del Proyecto"
        className="fixed inset-0 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0 bg-opacity-50 backdrop-blur-md"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Ingrese el Título del Proyecto</h2>
          <input
            type="text"
            className="w-full p-2 mb-4 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            onClick={handleProjectTitleSubmit}
          >
            Guardar
          </button>
        </div>
      </Modal>
      <ToastContainer />
    </div>
  );
}

export default App;