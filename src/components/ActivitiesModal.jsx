import Modal from 'react-modal';

const ActivitiesModal = ({
  isOpen,
  handleCloseActivitiesModal,
  activities,
  handleActivityClick,
}) => {
  return (
    <Modal
      isOpen={isOpen}
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
  );
};

export default ActivitiesModal;