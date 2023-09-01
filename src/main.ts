import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import { ErrorHandler } from "./errors/error_handler";
import "express-async-errors";
// import compression from "compression";
// import session from "express-session";
// import cors from "cors";
import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";

// Import all routes and websockets
import { MarketRouting } from "./routes/market";
import { DataRowRouting } from "./routes/datarow";
import { MarketWs } from "./websockets/marketWs";
import { DatarowWs } from "./websockets/datarowWs";
import { StatusWs } from "./websockets/status";
import { StatusRouting } from "./routes/status";

// Parse environment file.
// dotenv.config();

const PORT_NUMBER = 8080;

const app = express();
const server = require("http").createServer(app);

// Sentry
if (process.env.SENTRY_DSN) {
    console.log("Initializing Sentry.io SDK");
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        integrations: [
            // enable HTTP calls tracing
            new Sentry.Integrations.Http({ tracing: true }),
            // enable Express.js middleware tracing
            new Sentry.Integrations.Express({ app }),
            // Automatically instrument Node.js libraries and frameworks
            ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
            // Add profiling integration to list of integrations
            new ProfilingIntegration(),
        ],
        // Profiling sample rate is relative to tracesSampleRate
        profilesSampleRate: 1.0,
        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,
    });

    // RequestHandler creates a separate execution context, so that all
    // transactions/spans/breadcrumbs are isolated across requests
    app.use(Sentry.Handlers.requestHandler());
    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());
}

// JSON API support
app.use(
    express.json({
        inflate: true,
        strict: true,
        type: "application/json",
    }),
);

// Helmet adds many headers for more secure connections
app.use(helmet());

/*// Support for CORS
app.use(
    cors({
        origin: process.env.CORS,
        credentials: true,
    }),
);*/

// Morgan logs and prints all incoming requests
app.use(morgan("dev"));

// Assign the appropriate routers
const marketRouting = new MarketRouting();
const datarowRouting = new DataRowRouting();
const statusRouting = new StatusRouting();
app.use("/market", marketRouting.toRouter());
app.use("/datarow", datarowRouting.toRouter());
app.use("/status", statusRouting.toRouter());

// Use websockets
const WebSocket = require("ws");
const wss = new WebSocket.Server({ noServer: true });
const channelHandlers = new Map(); // map for the channel-specific handlers

channelHandlers.set("/market", (ws: WebSocket) => {
    const marketWs = new MarketWs();
    marketWs.connect(ws);
    marketRouting.setMarketWs(marketWs);
});

channelHandlers.set("/datarow", (ws: WebSocket) => {
    const datarowWs = new DatarowWs();
    datarowWs.connect(ws);
    datarowRouting.setDatarowWs(datarowWs);
});

channelHandlers.set("/status", (ws: WebSocket) => {
    const statusWs = new StatusWs();
    statusWs.connect(ws);
    statusRouting.setStatusWs(statusWs);
});

server.on("upgrade", (req: express.Request, socket: any, head: any) => {
    const channelHandler = channelHandlers.get(req.url);
    if (channelHandler) {
        wss.handleUpgrade(req, socket, head, (ws: any) => {
            channelHandler(ws);
        });
    } else {
        socket.destroy();
    }
});

// Use a custom made error handler
app.use(Sentry.Handlers.errorHandler());
app.use(ErrorHandler.handle);

// Actually start the server, we're done!
server.listen(PORT_NUMBER, () => {
    console.log(`API AVAILABLE AT: https://localhost:${PORT_NUMBER}`);
});

// export the server for testing
export default server;
