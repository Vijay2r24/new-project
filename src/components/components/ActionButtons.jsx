import { useTranslation } from "react-i18next";
import { Edit, Trash, MoreVertical } from 'lucide-react';

const ActionButtons = ({ id, onEdit, onDelete, onMore }) => {
     const { t } = useTranslation();
  return (
    <div className="flex items-center justify-end gap-2 mt-2">
      {onEdit && (
        <button onClick={() => onEdit(id)} className="action-button" title={t('common.edit')}>
          <Edit className="h-5 w-5" />
        </button>
      )}
      {onDelete && (
        <button onClick={() => onDelete(id)} className="action-button" title={t('common.delete')}>
          <Trash className="h-5 w-5" />
        </button>
      )}
      {onMore && (
        <button onClick={() => onMore(id)} className="action-button" title={t('common.more')}>
          <MoreVertical className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default ActionButtons;
