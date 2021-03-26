export function defaultErrorHandler(callback?: (message: string) => void): (error: Error) => void {
  return (error: Error) => {
    console.log("[API] Got Error", error);
    callback && callback(error.message);
  };
}
