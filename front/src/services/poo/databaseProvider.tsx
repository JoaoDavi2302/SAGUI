// aqui substitui por API
import { database } from "../poo/shared/types";
import { Database } from "../poo/shared/types";

export class DatabaseProvider {
    private static instance: Database;

    static getDatabase(): Database {
        if (!this.instance) {
            this.instance = database;
        }

        return this.instance;
    }
}