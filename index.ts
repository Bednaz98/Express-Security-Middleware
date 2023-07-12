import http from 'http';
import express, { Express } from "express"
import cors from 'cors'
import cookieParse from 'cookie-parser'
import { getCookieKey } from './src/cookies'

const app = express();
const httpPort = 3000;

export interface MiddlewareConfig {
    jsonLimitSize?: string | number | undefined
    disableCores?: boolean
    disableExpressTag?: boolean
    cookieParserSecure: () => string | string[]
    corsOption?: cors.CorsOptions
}
function setUpRequiredMiddleWare(app: Express, config: MiddlewareConfig) {
    // Auto convert all incoming request to json
    app.use(express.json({ "limit": config.jsonLimitSize }));
    // cookies par
    app.use(cookieParse(config.cookieParserSecure()));
    // enable cors
    if (!config.disableCores) {
        app.use(cors(config.corsOption));
    }
    // disable express tag for security
    if (!config.disableExpressTag) {
        app.disable('x-powered-by');
    }
}
const middleConfig = {
    jsonLimitSize: '50mb',
    cookieParserSecure: getCookieKey,
    cors: {
        credentials: true,
        origin: ['http://localhost:3000', 'http://localhost:19006', 'http://192.168.1.68:3000'],
        optionSuccessStatus: 200,
    }
};

setUpRequiredMiddleWare(app, middleConfig);

app.get("/test", (req, res) => res.status(200).send("valid"))

const httpServer = http.createServer(app);

export const getTestServer = () => ({
    startServer: () => httpServer.listen(httpPort, () => { console.log(`Started Server on port: ${httpPort}`) }),
    closServer: () => { httpServer.close(); console.log(`Closing Server on port: ${httpPort}`) }
})
