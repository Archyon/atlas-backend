import "ws";

// The type of data to be sent from the websocket to the listening web client
type DataRow = {
    time: String;
    market_name: String;
    open: Number;
    high: Number;
    low: Number;
    close: Number;
};

export class DatarowWs {
    ws: any;

    connect(ws: any) {
        this.ws = ws;
        console.log("websocket connected to channel datarow");
        this.ws.on("message", (message: any) => {
            this.ws.send("message received: " + message);
        });
    }

    sendData(data: DataRow) {
        this.ws.send("New datarow(s) added:\n" + data);
    }
}
