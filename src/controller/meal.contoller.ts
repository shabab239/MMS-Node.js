import { Body, Get, JsonController, Param, Post, QueryParam, Req, UseBefore } from "routing-controllers";
import { AppDataSource } from "../datasourse";
import { jwtMiddleware } from "../util/jwt.middleware";
import { Meal } from "../entity/meal.model";
import { User } from "../entity/user.model";
import { MealDTO } from "../dto/meal.dto";


@JsonController("/api/meal")
@UseBefore(jwtMiddleware)
export class MealController {

    @Get("/getMealsByUser")
    async getMealsByUser(
        @Req() req: any,
        @QueryParam("month") month: string,
        @QueryParam("year") year: string,
        @QueryParam("userId") userId: string
    ) {
        const mealRepository = AppDataSource.getRepository(Meal);

        try {
            const messId = req.messId;
            const whereClause: any = { messId };

            if (userId && !isNaN(parseInt(userId))) {
                whereClause.user = { id: parseInt(userId) };
            } else {
                throw new Error("Invalid user ID provided.");
            }

            if (month && !isNaN(parseInt(month))) {
                whereClause.month = parseInt(month);
            } else {
                throw new Error("Invalid month provided.");
            }

            if (year && !isNaN(parseInt(year))) {
                whereClause.year = parseInt(year);
            } else {
                throw new Error("Invalid year provided.");
            }

            return await mealRepository.find({ where: whereClause });
        } catch (error: any) {
            throw new Error("Error fetching meals: " + error.message);
        }
    }

    @Get("/getDailyMealRecords")
    async getDailyMealRecords(
        @Req() req: any,
        @QueryParam("day") day: string,
        @QueryParam("month") month: string,
        @QueryParam("year") year: string
    ) {
        const mealRepository = AppDataSource.getRepository(Meal);
        const userRepository = AppDataSource.getRepository(User);

        try {
            const messId = req.messId;
            let whereClause: any = { messId, month, year };

            let meals = await mealRepository.find({
                where: whereClause,
                relations: ["user"]
            });
            const users = await userRepository.find({ where: { messId } });

            const existingMealRecords = new Map<number, Meal>();
            meals.forEach(meal => {
                if (meal.user?.id) {
                    existingMealRecords.set(meal.user.id, meal);
                }
            });

            for (const user of users) {
                if (user.id && !existingMealRecords.has(user.id)) {
                    const newMeal: Meal = new Meal();
                    newMeal.user = user;
                    newMeal.month = parseInt(month);
                    newMeal.year = parseInt(year);
                    newMeal.messId = messId;

                    await mealRepository.save(newMeal);
                }
            }

            const dayNum = parseInt(day);
            if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
                throw new Error("Invalid day parameter. It must be between 1 and 31.");
            }

            const dayColumn = `day${dayNum}`;

            meals = await mealRepository.createQueryBuilder("meals")
                .select(["meals.userId", `${dayColumn} AS meals`, `${day} AS meals`])
                .where("meals.messId = :messId", { messId })
                .andWhere("meals.month = :month", { month })
                .andWhere("meals.year = :year", { year })
                .getRawMany();

            return meals;

        } catch (error: any) {
            throw new Error("Error fetching meals: " + error.message);
        }
    }


    @Post("/recordMeals")
    async recordMeals(@Req() req: any, @Body() meals: MealDTO[]) {
        const mealRepository = AppDataSource.getRepository(Meal);
        const messId = req.messId;

        try {
            for (const mealData of meals) {
                const { userId, day, meals: mealsCount, month, year } = mealData;

                if (!userId || !day || !mealsCount || !month || !year) {
                    throw new Error("Required params are not present.");
                }

                let mealRecord = await mealRepository.findOne({
                    where: { messId, month, year, user: { id: userId } },
                    relations: ["user"],
                });

                if (!mealRecord) {
                    mealRecord = new Meal();
                    mealRecord.messId = messId;
                    mealRecord.user = { id: userId } as any;
                    mealRecord.month = month;
                    mealRecord.year = year;
                }

                if (day >= 1 && day <= 31) {
                    (mealRecord as any)[`day${day}`] = mealsCount;
                } else {
                    throw new Error("Day must be between 1 and 31.");
                }

                await mealRepository.save(mealRecord);
            }

            return { message: "Meals recorded successfully" };
        } catch (error: any) {
            throw new Error("Error recording meals: " + error.message);
        }
    }

}


