import { useTranslation } from 'react-i18next';
import ReactDOM from 'react-dom';

const FullscreenErrorPopup = ({ message, onClose, children }) => {
  const { t } = useTranslation();
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-70 flex items-center justify-center">
      <div className="bg-white w-[90%] max-w-md p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-yellow-600 mb-2">{t('fullscreenErrorPopup.warning', 'Warning')}</h3>
        <p className="text-sm text-gray-700 mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          {typeof children !== 'undefined' ? children : (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              {t('fullscreenErrorPopup.close')}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.getElementById('portal-root')
  );
};

export default FullscreenErrorPopup;
