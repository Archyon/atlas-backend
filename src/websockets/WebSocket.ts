const Socket = require("ws");

/**
 * This class represents a websocket channel. The corresponding WebSocket `ws` is declared when a client connects
 * to the socket.
 * The subclasses represent the different endpoints of the socket. This is maintained in the variable `type`.
 *
 * connect      => this function lets a client connect to the websocket
 * sendData     => this function sends data to the listening clients
 */
export abstract class WebSocket {
    protected ws: typeof Socket;
    protected type: String = "websocket";

    connect(ws: typeof Socket) {
        this.ws = ws;
        console.log("websocket connected to channel %s", this.type);
        this.ws.on("message", (message: any) => {
            this.ws.send("message received: " + message);
        });
    }

    sendData(data: any) {
        this.ws.send(JSON.stringify(data));
    }
}
