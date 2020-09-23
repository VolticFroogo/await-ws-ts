import { AwaitClient } from "../src/client";
import { AwaitedResponse } from "../src/awaited-response";

const WebSocket = require('ws');

function main() {
    const websocket: WebSocket = new WebSocket('ws://localhost:8080/ws');
    const awaitClient: AwaitClient = new AwaitClient(websocket);

    websocket.onerror = (event: ErrorEvent) => console.error(event);
    websocket.onclose = (event: CloseEvent) => console.info(event);

    websocket.onmessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);

        if (awaitClient.handleResponse(data))
            return;

        if (awaitClient.isRequest(data))
            awaitClient.respond(data, 'Hello ' + data.message);
    };

    websocket.onopen = () => {
        awaitClient.request('client').then((awaitedResponse: AwaitedResponse) => {
            console.info(awaitedResponse.message);
        });
    }
}

main();
