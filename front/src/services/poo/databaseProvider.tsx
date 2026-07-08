// aqui substitui por API
<<<<<<< HEAD
import { database } from "../poo/shared/types";
=======
import database from "@/components/mock.json";
>>>>>>> origin/develop
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