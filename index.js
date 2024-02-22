import connect from "ajaxdb-client";
import { getCaracterPosition } from "./utils/utils.js";
import { ormParse } from "./orm/parser.js";

export class AjaxDBConnect {

    host = 'localhost';
    port = 3000;

    constructor(host, port, databaseName) {
    
        this.host = host;
        this.port = port;
        this.databaseName = databaseName;

    }

    async connection() {
        try{
            await connect(this.host, this.port, `INIT ${this.databaseName}`);
        }catch(err){
            throw new Error ('Error while connecting to JSDB server: ' + err.message);
        }
    }

    async tableQuery(query, params = []) {

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

        try{
            const result = await connect(this.host, this.port, queryWithValues);
            return result;
        }catch(err){
            throw new Error(err.message);
        }

    }

    async objectQuery(query, params = []) {
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

        try{
            const result = await connect(this.host, this.port, queryWithValues);
            return ormParse(result); // Por ahora, va a poder mandar un objeto con todos los elementos de todas las queries
        }catch(err){
            throw new Error(err.message);
        }
    }

}