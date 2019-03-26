import { Express } from "express";
/**
 * Defines options for the backend
 * socket remote to HA Proxy
 */
export interface HAProxyOptions {
    /**
     * The endpoint for the socket remote to communicate with
     */
    host: string;
    /**
     * The port of the socket listener.
     */
    port: number;
}

/**
 * Defines configuration for the express application
 * and backend remote handler.
 */
export interface AppOptions {
    /**
     * The API port for the express server to listen on.
     */
    apiPort: number;
    /**
     * The options for the socket remote to
     * talk with HA Proxy
     */
    socket: HAProxyOptions;
    /**
     * Optional custom application to use rather than creating a new
     * application. Useful to run this on top of existing API components.
     */
    app?: Express;
}