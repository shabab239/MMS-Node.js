import {DataSource} from "typeorm";
import {User} from "./entity/user.model";
import * as dotenv from "dotenv";
import {Bazar} from "./entity/bazar.model";
import {Bill} from "./entity/bill.model";
import {Meal} from "./entity/meal.model";
import {Mess} from "./entity/mess.model";
import {Utility} from "./entity/utility.model";
import {Transaction} from "./entity/transaction.model";
import { addTransactionalDataSource } from "typeorm-transactional";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT as string),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: true, // Set to false in production
    logging: false,
    entities: [Bazar, Bill, Meal, Mess, User, Utility, Transaction],
});

addTransactionalDataSource(AppDataSource);
