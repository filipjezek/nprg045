export function promiseTimeout(timeout?: number) {
  return new Promise((res, rej) => {
    setTimeout(res, timeout);
  });
}
