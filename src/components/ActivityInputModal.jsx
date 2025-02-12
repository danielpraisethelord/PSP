import Modal from 'react-modal';

const ActivityInputModal = ({
  isOpen,
  handleCloseActivityInputModal,
  handleActivityInputSubmit,
  newActivityName,
  setNewActivityName,
}) => {
  return (
    <Modal
      isOpen={isOpen}
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
  );
};

export default ActivityInputModal;