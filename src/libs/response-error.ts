export type ApiErrorResponse = {
  code: number;
  status: number;
  message: string;
  error: string;
};

class ResponseError {
  // readonly code: ApiErrorResponse['code'];
  // readonly status: ApiErrorResponse['status'];
  // readonly message: ApiErrorResponse['message'];
  // readonly defaultText: string;
  readonly error: string;

  constructor(response: any) {
    const { detail } = response;
    // this.code = code;
    // this.status = status;
    // this.message = message;
    // this.defaultText = `Error Code ${code}: ${message}`;
    this.error = detail;
  }
}

export default ResponseError;
