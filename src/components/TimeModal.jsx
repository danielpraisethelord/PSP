import Modal from 'react-modal';

const TimeModal = ({ isOpen, handleCloseModal, selectedActivity, audio }) => {
  return (
    <Modal
      isOpen={isOpen}
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
            ? `Tiempo: ${(selectedActivity.time / 60).toFixed(2)} minutos`
            : '¡La actividad ha superado los 60 minutos!'}
        </p>
        {selectedActivity && (
          <>
            <p className="text-gray-900 dark:text-white">
              Tiempo de Pausa: ${(selectedActivity.totalPauseTime / 60).toFixed(2)} minutos
            </p>
            <p className="text-gray-900 dark:text-white">
              Tiempo Total: ${(selectedActivity.totalTime / 60).toFixed(2)} minutos
            </p>
            <div className="mt-4">
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Comentarios:</h3>
              <ul className="list-disc list-inside text-gray-900 dark:text-white">
                {selectedActivity.comments.map((comment, index) => (
                  <li key={index}>
                    {comment.timestamp}: {comment.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Horas de Inicio:</h3>
              <ul className="list-disc list-inside text-gray-900 dark:text-white">
                {selectedActivity.startTimes.map((startTime, index) => (
                  <li key={index}>{startTime}</li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Horas de Fin:</h3>
              <ul className="list-disc list-inside text-gray-900 dark:text-white">
                {selectedActivity.endTimes.map((endTime, index) => (
                  <li key={index}>{endTime}</li>
                ))}
              </ul>
            </div>
          </>
        )}
        <button
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
          onClick={handleCloseModal}
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
};

export default TimeModal;