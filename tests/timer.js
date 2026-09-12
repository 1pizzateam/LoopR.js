export function timer(callback) {
  setTimeout(() => {
    if (callback) {
      callback();
    }
  }, 1000);
}