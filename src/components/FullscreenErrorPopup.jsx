import { useTranslation } from 'react-i18next';
import ReactDOM from 'react-dom';

const FullscreenConfirmationPopup = ({ message, onClose, onConfirm, title }) => {
  const { t } = useTranslation();

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative w-80 bg-white rounded-2xl overflow-hidden text-center shadow-xl">
        <div className="relative h-24 bg-custom-bg rounded-t-2xl flex items-end justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:18px_18px]"></div>
          <div className="w-12 h-12 bg-white border-[3px] border-custom-bg rounded-full flex items-center justify-center translate-y-1/2 shadow-md">
            <span className="text-blue-500 font-bold text-2xl leading-none">?</span>
          </div>
        </div>
        <div className="px-6 pt-8 pb-6">
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-gray-700 mb-6">
            {message}
          </p>
          <div className="flex justify-center gap-4">
            <button
              className="px-6 py-2 border border-custom-bg rounded-full text-custom-bg hover:text-white hover:bg-custom-bg transition"
              onClick={onClose}
            >
              {t('COMMON.NO')}
            </button>
            <button
              className="px-6 py-2 bg-custom-bg text-white rounded-full hover:bg-custom-bg  transition"
              onClick={onConfirm}
            >
              {t('COMMON.YES')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('portal-root')
  );
};

export default FullscreenConfirmationPopup;
