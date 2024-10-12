import "reflect-metadata";
import {createExpressServer} from "routing-controllers";
import {UserController} from "./controller/user.contoller";
import {AppDataSource} from "./datasourse";
import express from "express";
import {AuthController} from "./controller/auth.controller";
import {MealController} from "./controller/meal.contoller";
import {BillController} from "./controller/bill.contoller";
import {TransactionController} from "./controller/transaction.contoller";

const app = createExpressServer({
    controllers: [UserController, AuthController, MealController, BillController, TransactionController],
});

app.use(express.json());

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
        const PORT = 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error during Data Source initialization", error);
    });
