import {Body, Delete, JsonController, Param, Post, Req, UseBefore} from "routing-controllers";
import {AppDataSource} from "../datasourse";
import {jwtMiddleware} from "../util/jwt.middleware";
import {Transaction} from "../entity/transaction.model";
import {TransactionType} from "../entity/transaction.type";
import {User} from "../entity/user.model";
import {Mess} from "../entity/mess.model";


@JsonController("/api/transaction")
@UseBefore(jwtMiddleware)
export class TransactionController {

    @Post("/createTransaction")
    async createTransaction(@Body() transactionData: Transaction, @Req() req: any) {
        const transactionRepository = AppDataSource.getRepository(Transaction);
        const userRepository = AppDataSource.getRepository(User);
        const messRepository = AppDataSource.getRepository(Mess);

        transactionData.messId = req.messId;

        try {
            const user = await userRepository.findOneOrFail({where: {id: transactionData.user?.id}});
            const mess = await messRepository.findOneOrFail({where: {id: transactionData.messId}});

            if (transactionData.type === TransactionType.DEPOSIT) {
                user.balance = (user.balance ?? 0) + (transactionData.amount ?? 0);
                mess.balance = (mess.balance ?? 0) + (transactionData.amount ?? 0);
            } else if (transactionData.type === TransactionType.WITHDRAW) {
                user.balance = (user.balance ?? 0) - (transactionData.amount ?? 0);
                mess.balance = (mess.balance ?? 0) - (transactionData.amount ?? 0);
            }

            await userRepository.save(user);
            await messRepository.save(mess);
            await transactionRepository.save(transactionData);

            return transactionData;
        } catch (error: any) {
            throw new Error("Error creating transaction: " + error.message);
        }
    }

    @Delete("/deleteTransaction/:id")
    async deleteTransaction(@Param("id") id: number, @Req() req: any) {
        const transactionRepository = AppDataSource.getRepository(Transaction);
        const userRepository = AppDataSource.getRepository(User);
        const messRepository = AppDataSource.getRepository(Mess);

        try {
            const transaction = await transactionRepository.findOneOrFail({ where: { id, messId: req.messId }, relations: ['user'] });
            const user = await userRepository.findOneOrFail({ where: { id: transaction.user?.id } });
            const mess = await messRepository.findOneOrFail({ where: { id: transaction.messId } });

            if (transaction.type === TransactionType.DEPOSIT) {
                user.balance = (user.balance ?? 0) - (transaction.amount ?? 0);
                mess.balance = (mess.balance ?? 0) - (transaction.amount ?? 0);
            } else if (transaction.type === TransactionType.WITHDRAW) {
                user.balance = (user.balance ?? 0) + (transaction.amount ?? 0);
                mess.balance = (mess.balance ?? 0) + (transaction.amount ?? 0);
            }

            await userRepository.save(user);
            await messRepository.save(mess);
            await transactionRepository.delete(id);

            return { message: "Transaction deleted and balances reverted successfully" };
        } catch (error: any) {
            throw new Error("Error deleting transaction: " + error.message);
        }
    }


}


