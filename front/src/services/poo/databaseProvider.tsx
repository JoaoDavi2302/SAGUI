// aqui substitui por API
import database from "@/components/mock.json";
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