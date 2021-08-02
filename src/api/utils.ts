export function defaultErrorHandler(callback?: (message: string) => void): (error: Error) => void {
  return (error: Error) => {
    console.log("[API] Got Error", error);
    callback && callback(error.message);
  };
}

export function getErrorCause(error: any): string {
  if (error.response === undefined || error.response.data === undefined ) {
    return error;
  } else {
    return JSON.stringify(error.response.data);
  }
}
