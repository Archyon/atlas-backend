import "ws";

export class MarketWs {
    ws: any;

    connect(ws: any) {
        this.ws = ws;
        console.log("websocket connected to channel market")
        this.ws.on("message", (message: any) => {
            console.log("message: " + message)
            this.ws.send("message received: " + message);
        })
    }
}