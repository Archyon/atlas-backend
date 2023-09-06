import { WebSocket } from "./WebSocket";

export class DatarowWs extends WebSocket {
    constructor() {
        super();
        this.type = "datarow";
    }
}
