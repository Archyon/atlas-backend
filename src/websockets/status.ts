import { WebSocket } from "./WebSocket";

export class StatusWs extends WebSocket {
    constructor() {
        super();
        this.type = "status";
    }

    sendData(data: any) {
        super.sendData(data);
    }
}
