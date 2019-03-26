import { Socket, connect } from "net";
import { HAProxyOptions } from "./options.interface";

export class HAProxyConnection {
    constructor(
        private readonly options: HAProxyOptions
    ) {
        if (!options) throw new Error("Socket connection information is required.");
    }

    public send(message: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const socket: Socket = connect(this.options);
            let output: string = "";
            socket.on("data", (data: Buffer) => {
                output += data;
            });
            socket.on("end", () => {
                resolve(output);
                socket.end();
            });
            if (!message.endsWith("\n")) {
                message += "\n";
            }
            socket.write(message, err => {
                reject(err);
                socket.end();
            });
        });
    }
}