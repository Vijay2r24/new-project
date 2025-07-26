export function hideLoaderWithDelay(setLoading, delay = 500) {
  setTimeout(() => setLoading(false), delay);
} 