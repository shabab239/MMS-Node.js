import {Get, JsonController, Param, Post, Req, UseBefore} from "routing-controllers";
import {AppDataSource} from "../datasourse";
import {jwtMiddleware} from "../util/jwt.middleware";
import {Meal} from "../entity/meal.model";
import {Bazar} from "../entity/bazar.model";
import {User} from "../entity/user.model";
import {Utility} from "../entity/utility.model";


@JsonController("/api/bill")
@UseBefore(jwtMiddleware)
export class BillController {

    @Post("/generateBill/:month/:year")
    async generateBill(@Req() req: any, @Param("month") month: number, @Param("year") year: number) {
        const mealRepository = AppDataSource.getRepository(Meal);
        const bazarRepository = AppDataSource.getRepository(Bazar);
        const userRepository = AppDataSource.getRepository(User);
        const utilityRepository = AppDataSource.getRepository(Utility); // Assuming you have a Utility entity

        const messId = req.messId;

        try {
            const totalBazarCost = await bazarRepository
                .createQueryBuilder("bazar")
                .where("bazar.messId = :messId", { messId })
                .andWhere("MONTH(bazar.date) = :month", { month })
                .andWhere("YEAR(bazar.date) = :year", { year })
                .select("SUM(bazar.cost)", "total")
                .getRawOne();

            const totalBazar = totalBazarCost?.total || 0;

            const meals = await mealRepository.find({
                where: { messId, month, year },
                relations: ["user"]
            });

            let totalMeals = 0;
            const userMeals: { [userId: number]: number } = {};

            meals.forEach(meal => {
                const userId = (meal.user as any).id;
                let userTotalMeals = 0;

                for (let i = 1; i <= 31; i++) {
                    const dayMeal = (meal as any)[`day${i}`] || 0;
                    userTotalMeals += dayMeal;
                }

                totalMeals += userTotalMeals;
                userMeals[userId] = (userMeals[userId] || 0) + userTotalMeals;
            });

            const costPerMeal = totalMeals > 0 ? totalBazar / totalMeals : 0;

            const totalUtilityCost = await utilityRepository
                .createQueryBuilder("utility")
                .where("utility.messId = :messId", { messId })
                .andWhere("utility.month = :month", { month })
                .andWhere("utility.year = :year", { year })
                .select("SUM(utility.cost)", "total")
                .getRawOne();

            const utilityTotal = totalUtilityCost?.total || 0;

            const users = await userRepository.find({ where: { messId } });

            const utilityCostPerHead = users.length > 0 ? utilityTotal / users.length : 0;

            const userBills = users.map(user => {
                const mealsEaten = userMeals[user.id as number] || 0;
                const mealCost = mealsEaten * costPerMeal;
                const totalBill = mealCost + utilityCostPerHead;

                return {
                    userId: user.id,
                    userName: user.name,
                    totalMeals: mealsEaten,
                    mealCost,
                    utilityCost: utilityCostPerHead,
                    totalBill
                };
            });

            return userBills;

        } catch (error: any) {
            throw new Error("Error generating bill: " + error.message);
        }
    }


}


