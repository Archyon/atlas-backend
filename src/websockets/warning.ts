import { WebSocket } from "./WebSocket";

export class WarningWs extends WebSocket {
    constructor() {
        super();
        this.type = "warning";
    }

    sendData(data: any) {
        const parsed = {
            origin: data.origin,
            message: data.message,
            ref: JSON.parse(data.ref),
        };
        this.ws.send(JSON.stringify(parsed));
    }
}
