import { useState, useEffect } from 'react';
import { activitiesList } from '../constants/activities';

const Timer = ({
  activity,
  setActivity,
  isRunning,
  setIsRunning,
  time,
  setTime,
  activities,
  setActivities,
  isActivityInputModalOpen,
  setIsActivityInputModalOpen,
  newActivityName,
  setNewActivityName,
  pauseStartTime,
  setPauseStartTime,
  totalPauseTime,
  setTotalPauseTime,
  setIsModalOpen,
  setAudio
}) => {
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [comment, setComment] = useState('');

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
  }, [time, setIsModalOpen, setAudio]);

  const handleStart = () => {
    if (selectedActivityId) {
      const selectedActivity = activitiesList.find(activity => activity.id === parseInt(selectedActivityId, 10));
      if (selectedActivity.id === 10 && !newActivityName) {
        setIsActivityInputModalOpen(true);
        return;
      }

      const timestamp = new Date().toLocaleString();

      let updatedActivities;
      const existingActivity = activities.find(a => a.id === selectedActivity.id);

      if (existingActivity) {
        setTime(existingActivity.time);
        setTotalPauseTime(existingActivity.totalPauseTime);
        if (comment) {
          const newComment = {
            text: comment,
            timestamp,
          };
          existingActivity.comments.push(newComment);
        }
        updatedActivities = activities.map(a =>
          a.id === parseInt(selectedActivityId, 10)
            ? existingActivity
            : a
        );
      } else {
        const newComment = {
          text: comment || 'Inicio de actividad',
          timestamp,
        };
        updatedActivities = [
          ...activities,
          {
            id: parseInt(selectedActivityId, 10),
            name: selectedActivity.id === 10 ? newActivityName : selectedActivity.name,
            time: 0,
            totalPauseTime: 0,
            totalTime: 0,
            comments: [newComment],
          },
        ];
      }

      setActivities(updatedActivities);
      setComment('');

      if (pauseStartTime) {
        const pauseEndTime = Date.now();
        const pauseDuration = (pauseEndTime - pauseStartTime) / 1000;
        setTotalPauseTime(totalPauseTime + pauseDuration);
        setPauseStartTime(null);
      }

      setActivity(selectedActivity.id === 10 ? newActivityName : selectedActivity.name);
      setIsRunning(true);
    }
  };

  const handleActivityInputSubmit = () => {
    if (newActivityName) {
      setActivity(newActivityName);
      setIsRunning(true);
      setIsActivityInputModalOpen(false);
      setNewActivityName('');
    }
  };

  const handlePause = () => {
    setIsRunning(false);
    setPauseStartTime(Date.now());

    const updatedActivities = activities.map(a =>
      a.id === parseInt(selectedActivityId, 10)
        ? { ...a, time }
        : a
    );

    setActivities(updatedActivities);
  };

  const handleStop = () => {
    if (!isRunning) return;
    const pauseEndTime = Date.now();
    const pauseDuration = pauseStartTime ? (pauseEndTime - pauseStartTime) / 1000 : 0;
    setTotalPauseTime(totalPauseTime + pauseDuration);
    setIsRunning(false);

    const updatedActivities = activities.map(a =>
      a.id === parseInt(selectedActivityId, 10)
        ? { 
            ...a, 
            time, 
            totalPauseTime: totalPauseTime + pauseDuration, 
            totalTime: time + totalPauseTime + pauseDuration // Ajustado
          }
        : a
    );    

    setActivities(updatedActivities);
    setTime(0);
    setActivity('');
    setTotalPauseTime(0);
    setPauseStartTime(null);
    setSelectedActivityId('');
  };

  return (
    <div className="mt-4 p-4 bg-gray-800 shadow-md rounded-lg">
      <div className="text-2xl mb-4">
        {new Date(time * 1000).toISOString().substr(11, 8)}
      </div>
      <div className="mb-4">
        <select 
          value={selectedActivityId} 
          onChange={(e) => setSelectedActivityId(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white"
        >
          <option value="">Selecciona una actividad</option>
          {activitiesList.map((activity) => (
            <option key={activity.id} value={activity.id}>{activity.name}</option>
          ))}
        </select>
        {selectedActivityId === "10" && (
          <input 
            type="text" 
            className="p-2 rounded bg-gray-700 text-white ml-2"
            placeholder="Nombre de la actividad"
            value={newActivityName}
            onChange={(e) => setNewActivityName(e.target.value)}
          />
        )}
      </div>
      <div className="mb-4">
        <textarea
          className="p-2 rounded bg-gray-700 text-white w-full"
          placeholder="Añadir comentario"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
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
  );
};

export default Timer;