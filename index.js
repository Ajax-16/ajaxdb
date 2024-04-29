import { connect, serverHandShake } from "nuedb-client";
import { getCaracterPosition } from "./utils/utils.js";
import { ormParse } from "./orm/parser.js";

export class NueDBDriver {

    connected = false;

    constructor({ host, port, database }) {
        this.host = host;
        this.port = port;
        this.database = database
    }

    async connection() {

        try {
            const { success } = await serverHandShake(this.host, this.port);
            if (success) {
                await connect(this.host, this.port, `INIT ${this.database}`)
            }
            this.connected = success;
            return this;

        } catch (err) {
            throw new Error('Error while connecting to NueDB server: ' + err.message);
        }
    }

    async queryRaw(query, params = []) {

        if (this.connected) {

            const variablePositions = getCaracterPosition(query, '?');

            if (!Array.isArray(params)) {
                throw new Error('Invalid parameters. Expected an Array containing "?" placeholders.');
            }

            if (params.length !== variablePositions.length) {
                throw new Error('Number of parameters does not match the number of "?" placeholders.');
            }

            const queryWithValues = query.replace(/\?/g, () => {
                const value = params.shift();
                return typeof value === 'string' ? `'${value}'` : value;
            });

            try {
            const results = await connect(this.host, this.port, queryWithValues);
            const responses = []
            for(const result of results) {
                for(const element of result.body) {
                    responses.push(element)
                }
            }
            return responses;
            } catch (err) {
                throw err;
            }

        } else {
            return { "error": "You have not access to NueDB server because the handshake was not successful" }
        }

    }

    async query(query, params = []) {

        if (this.connected) {

        const variablePositions = getCaracterPosition(query, '?');

        if (!Array.isArray(params)) {
            throw new Error('Invalid parameters. Expected an Array containing "?" placeholders.');
        }

        if (params.length !== variablePositions.length) {
            throw new Error('Number of parameters does not match the number of "?" placeholders.');
        }

        const queryWithValues = query.replace(/\?/g, () => {
            const value = params.shift();
            return typeof value === 'string' ? `'${value}'` : value;
        });

        try {
            const results = await connect(this.host, this.port, queryWithValues);
            const responses = []
            for(const result of results) {
                for(const element of result.body) {
                    responses.push(ormParse(element))
                }
            }
            return responses; // Por ahora, va a poder mandar un objeto con todos los elementos de todas las queries
        } catch (err) {
            throw err;
        }

    } else {
        return { "error": "You have not access to NueDB server because the handshake was not successful" }
    }

    }

}