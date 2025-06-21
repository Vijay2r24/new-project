// src/utils/ShowEmsg.jsx
import toast from 'react-hot-toast';

export const showEmsg = (message, type) => {
  if (type === 'success') {
    toast.success(message);
  } else if (type === 'error') {
    toast.error(message);
  } else if (type === 'info') {
    toast(message);
  } else if (type === 'warning') {
    toast(message);
  } else {
    toast(message);
  }
};
