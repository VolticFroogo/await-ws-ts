import { AwaitedResponse } from "./awaited-response";

export class AwaitClient {
    private websocket: WebSocket;
    private nextID: number;
    private waitingResponses: Map<number, (value?: AwaitedResponse) => void>;

    constructor(websocket: WebSocket) {
        this.websocket = websocket;
        this.nextID = 0;
        this.waitingResponses = new Map<number, (value?: AwaitedResponse) => void>();
    }

    request(message: any): Promise<AwaitedResponse> {
        const id = this.nextID++;

        const promise = new Promise<AwaitedResponse>((resolve) => {
            this.waitingResponses.set(id, resolve);
        });

        this.websocket.send(JSON.stringify({
            id: id,
            request: true,
            message: message
        }));

        return promise;
    }

    isRequest(message: any): boolean {
        if (!message.hasOwnProperty('request'))
            return false;

        if (typeof message.request !== 'boolean')
            return false;

        return message.request as boolean;
    }

    handleResponse(message: any): boolean {
        if (!message.hasOwnProperty('response'))
            return false;

        if (typeof message.response !== 'boolean')
            return false;

        if (!(message.response as boolean))
            return false;

        if (!message.hasOwnProperty('id'))
            return false;

        if (typeof message.id !== 'number')
            return false;

        const id: number = message.id as number;

        this.waitingResponses.get(id)(new AwaitedResponse(message.message, null));
        this.waitingResponses.delete(id);

        return true;
    }

    respond(request: any, response: any): void {
        if (!request.hasOwnProperty('id'))
            return;

        if (typeof request.id !== 'number')
            return;

        this.websocket.send(JSON.stringify({
            id: request.id as number,
            response: true,
            message: response
        }));
    }
}
