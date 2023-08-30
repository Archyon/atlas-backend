import "ws";

export class DatarowWs {
    ws: any;

    connect(ws: any) {
        this.ws = ws;
        console.log("websocket connected to channel datarow")
        this.ws.on("message", (message: any) => {
            console.log("message: " + message)
            this.ws.send("message received: " + message);
        })
    }
}
