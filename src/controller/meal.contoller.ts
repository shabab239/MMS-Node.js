import { Body, Get, JsonController, Param, Post, QueryParam, Req, UseBefore } from "routing-controllers";
import { AppDataSource } from "../datasourse";
import { jwtMiddleware } from "../util/jwt.middleware";
import { Meal } from "../entity/meal.model";
import { User } from "../entity/user.model";
import { MealDTO } from "../dto/meal.dto";
import { ApiResponse } from "../util/api.response";

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
        const response = new ApiResponse();
        const mealRepository = AppDataSource.getRepository(Meal);

        try {
            const messId = req.messId;
            const whereClause: any = { messId };

            if (userId && !isNaN(parseInt(userId))) {
                whereClause.user = { id: parseInt(userId) };
            } else {
                return response.error("Invalid user ID provided.");
            }

            if (month && !isNaN(parseInt(month))) {
                whereClause.month = parseInt(month);
            } else {
                return response.error("Invalid month provided.");
            }

            if (year && !isNaN(parseInt(year))) {
                whereClause.year = parseInt(year);
            } else {
                return response.error("Invalid year provided.");
            }

            const meals = await mealRepository.find({ where: whereClause });
            response.setData("meals", meals);
            response.success("Meals fetched successfully");
            return response;
        } catch (error: any) {
            return response.errorFromException(error);
        }
    }

    @Get("/getDailyMealRecords")
    async getDailyMealRecords(
        @Req() req: any,
        @QueryParam("day") day: string,
        @QueryParam("month") month: string,
        @QueryParam("year") year: string
    ) {
        const response = new ApiResponse();
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
                return response.error("Invalid day parameter. It must be between 1 and 31.");
            }

            const dayColumn = `day${dayNum}`;

            meals = await mealRepository.query(`
                SELECT U.id AS userId, U.name AS username, ${dayColumn} AS meals, ${day} AS day, ${month} AS month, ${year} AS year
                FROM meals M JOIN users U ON U.id = M.userId
                WHERE M.messId = ?
                AND U.messId = ?
                AND month = ?
                AND year = ?
            `, [messId, messId, month, year]);

            meals = meals.map(meal => ({
                ...meal,
                meals: Number((meal as any).meals),
            }));

            response.setData("meals", meals);
            response.success("Daily meals fetched successfully");
            return response;

        } catch (error: any) {
            return response.errorFromException(error);
        }
    }

    @Post("/recordMeals")
    async recordMeals(@Req() req: any, @Body() meals: MealDTO[]) {
        const response = new ApiResponse();
        const mealRepository = AppDataSource.getRepository(Meal);
        const messId = req.messId;

        try {
            for (const mealData of meals) {
                const { userId, day, meals, month, year } = mealData;

                if (userId == null || day == null || meals == null || month == null || year == null) {
                    return response.error("Required params are not present.");
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
                    (mealRecord as any)[`day${day}`] = meals;
                } else {
                    return response.error("Day must be between 1 and 31.");
                }

                await mealRepository.save(mealRecord);
            }

            response.success("Meals recorded successfully");
            return response;
        } catch (error: any) {
            return response.errorFromException(error);
        }
    }
}
