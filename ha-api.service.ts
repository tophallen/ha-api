import { createServer, Server } from "http";
import * as express from "express";
import { Express, Request, Response, NextFunction } from "express";
import { AppOptions } from "options.interface";
import { HAProxyRemote } from "ha-remote.service";
import { json } from "body-parser";

export class HAProxyAPI {
    private readonly app: Express;
    private server: Server;
    private readonly remote: HAProxyRemote;

    constructor(
        private readonly options: AppOptions
    ) {
        if (!options) throw new Error("Configuration is required - please specify endpoints and ports.");
        if (options.app) {
            this.app = options.app;
        } else {
            this.app = express();
        }
        this.app.set("port", this.options.apiPort);
        this.app.use(json());
        this.remote = new HAProxyRemote(options.socket);
    }

    /**
     * Changes the server state.
     * /backend/:backend/server/:server/:operation
     * @param req The request
     * @param res The response
     * @param next The next handler
     */
    public changeServerState(req: Request, res: Response, next: NextFunction): void {
        switch (req.params.operation) {
            case "enable":
                this.remote.backend(req.params.backend).server(req.params.server).enable().then(this.handleRespose, this.handleError);
                break;
            case "disable":
                this.remote.backend(req.params.backend).server(req.params.server).disable().then(this.handleRespose, this.handleError);
                break;
            case "drain":
                this.remote.backend(req.params.backend).server(req.params.server).drain().then(this.handleRespose, this.handleError);
                break;
            default:
                res.status(400).send("invalid operation type.");
                break;
        }
    }

    /**
     * Changes the frontend state.
     * /frontend/:frontend/:operation
     * @param req The request
     * @param res The response
     * @param next The next handler
     */
    public changeFrontendState(req: Request, res: Response, next: NextFunction): void {
        switch (req.params.operation) {
            case "enable":
                this.remote.frontend(req.params.frontend).enable().then(this.handleRespose, this.handleError);
                break;
            case "disable":
                this.remote.frontend(req.params.frontend).disable().then(this.handleRespose, this.handleError);
                break;
            default:
                res.status(400).send("invalid operation type.");
                break;
        }
    }

    public getInfo(req: Request, res: Response, next: NextFunction): void {

    }

    public getStats(req: Request, res: Response, next: NextFunction): void {

    }

    /**
     * Starts the web server and listens on the port provided in
     * the configuration.
     */
    public start(): void {
        if (this.app.get("port")) {
            this.server = createServer(this.app);
            this.server.listen(this.app.get("port"), () => {
                console.log(`Started Express server listening on port ${this.app.get("port")}`)
            });
        }
    }

    /**
     * Stops the web server and closes the listener.
     */
    public stop(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.server) {
                this.server.close(err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    private handleRespose(res: Response): (data: string) => void {
        return (data: string) => {
            if (data === "\n") {
                res.status(204).send();
            } else {
                res.status(200).send(data);
            }
        };
    }

    private handleError(res: Response): (err: any) => void {
        return (err: any) => {
            res.status(400).send(err);
        };
    }
}