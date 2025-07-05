
import { toast } from "react-toastify";

export const showEmsg = (
  message,
  type,
  duration = 3000,
  onCloseCallback = null
) => {
  const options = {
    position: "top-right",
    autoClose: duration,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    onClose: onCloseCallback,
  };

  switch (type) {
    case "success":
      return toast.success(message, options);
    case "error":
      return toast.error(message, options);
    case "info":
      return toast.info(message, options);
    case "warning":
      return toast.warn(message, options);
    default:
      return toast(message, options);
  }
};
