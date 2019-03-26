import { HAProxyConnection } from "./ha-connection.service";
import { HAProxyOptions } from "./options.interface";

const CACHE_TTL: number = 1000;
const GLOBAL_STAT_OPTS = {
    proxyId: -1,
    serverId: -1,
    types: 7
};

class HAProxyFrontend {
    constructor(
        private readonly connection: HAProxyConnection,
        private readonly frontendName: string
    ) {
    }

    public disable(): Promise<any> {
        return this.connection.send(`disable frontend ${this.frontendName}`);
    }

    public enable(): Promise<any> {
        return this.connection.send(`enable frontend ${this.frontendName}`);
    }
}

class HAProxyBackend {
    constructor(
        private readonly connection: HAProxyConnection,
        private readonly backendName: string
    ) {
    }

    public server(serverName: string): HAProxyServer {
        return new HAProxyServer(this.connection, this.backendName, serverName);
    }
}

class HAProxyServer {
    constructor(
        private readonly connection: HAProxyConnection,
        private readonly backendName: string,
        private readonly serverName: string
    ) {
    }

    public disable(): Promise<any> {
        return this.connection.send(`disable server ${this.backendName}/${this.serverName}`);
    }

    public enable(): Promise<any> {
        return this.connection.send(`enable server ${this.backendName}/${this.serverName}`);
    }

    public drain(): Promise<any> {
        return this.connection.send(`set server ${this.backendName}/${this.serverName} state drain`);
    }
}

export class HAProxyRemote {
    private readonly connection: HAProxyConnection;

    constructor(
        private readonly config: HAProxyOptions
    ) {
        this.connection = new HAProxyConnection(config);
    }

    public frontend(frontendName: string): HAProxyFrontend {
        return new HAProxyFrontend(this.connection, frontendName);
    }

    public backend(backendName: string): HAProxyBackend {
        return new HAProxyBackend(this.connection, backendName);
    }
}