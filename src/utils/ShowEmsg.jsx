import { toast } from "react-toastify";

export const showEmsg = (
  message,
  type = "info",
  duration = 1400,
  onCloseCallback = null
) => {
  const safeDuration =
    typeof duration === "number" && duration > 0 ? duration : 3000;

  const options = {
    position: "top-right",
    autoClose: safeDuration,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    onClose: onCloseCallback || undefined,
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
