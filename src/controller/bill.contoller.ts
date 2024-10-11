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
            // 1. Get total bazar cost for the month
            const totalBazarCost = await bazarRepository
                .createQueryBuilder("bazar")
                .where("bazar.messId = :messId", { messId })
                .andWhere("MONTH(bazar.date) = :month", { month })
                .andWhere("YEAR(bazar.date) = :year", { year })
                .select("SUM(bazar.cost)", "total")
                .getRawOne();

            const totalBazar = totalBazarCost?.total || 0;

            // 2. Get all meals for the month
            const meals = await mealRepository.find({
                where: { messId, month, year },
                relations: ["user"]
            });

            let totalMeals = 0;
            const userMeals: { [userId: number]: number } = {};

            meals.forEach(meal => {
                const userId = (meal.user as any).id;
                let userTotalMeals = 0;

                // Assuming your Meal entity has days as dynamic fields (e.g. day1, day2, etc.)
                for (let i = 1; i <= 31; i++) {
                    const dayMeal = (meal as any)[`day${i}`] || 0;
                    userTotalMeals += dayMeal;
                }

                totalMeals += userTotalMeals;
                userMeals[userId] = (userMeals[userId] || 0) + userTotalMeals;
            });

            // 3. Calculate cost per meal
            const costPerMeal = totalMeals > 0 ? totalBazar / totalMeals : 0;

            // 4. Get total utility costs for the month, year, and messId
            const totalUtilityCost = await utilityRepository
                .createQueryBuilder("utility")
                .where("utility.messId = :messId", { messId })
                .andWhere("utility.month = :month", { month })
                .andWhere("utility.year = :year", { year })
                .select("SUM(utility.cost)", "total")
                .getRawOne();

            const utilityTotal = totalUtilityCost?.total || 0;

            // 5. Get all users for the given messId
            const users = await userRepository.find({ where: { messId } });

            // Calculate utility cost per head
            const utilityCostPerHead = users.length > 0 ? utilityTotal / users.length : 0;

            // 6. Calculate the bill for each user
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


