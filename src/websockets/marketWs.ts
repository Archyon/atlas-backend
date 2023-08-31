import "ws";
import { WebSocket } from "./WebSocket";

export class MarketWs extends WebSocket {
    constructor() {
        super();
        this.type = "market";
    }
}
