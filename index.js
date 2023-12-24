import connect from "ajaxdb-client";
import { getCaracterPosition } from "./utils/utils.js";

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

    async query(query, params) {

        const variablePositions = getCaracterPosition(query, '?');

        if (!Array.isArray(params)) {
            throw new Error('Invalid parameters. Expected an Array containing "?" placeholders.');
        }

        if (params.length !== variablePositions.length) {
            throw new Error('Number of parameters does not match the number of "?" placeholders.');
        }

        const queryWithValues = variablePositions.reduce((result, position, index) => {
            return result.substring(0, position) + params[index] + result.substring(position + 1);
        }, query);

        try{
            const result = await connect(this.host, this.port, queryWithValues);
            return result;
        }catch(err){
            throw new Error(err.message);
        }

    }

}