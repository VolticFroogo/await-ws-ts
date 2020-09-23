export class AwaitedResponse {
    message: any;
    error: Error;

    constructor(message: any, error: Error) {
        this.message = message;
        this.error = error;
    }
}
