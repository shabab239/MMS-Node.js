import {Body, Get, JsonController, Param, Post, QueryParam, Req, UseBefore} from "routing-controllers";
import {AppDataSource} from "../datasourse";
import {jwtMiddleware} from "../util/jwt.middleware";
import {Meal} from "../entity/meal.model";


@JsonController("/api/meal")
@UseBefore(jwtMiddleware)
export class MealController {

    @Get("/getAllMeals")
    async getAllMeals(
        @Req() req: any,
        @QueryParam("month", { required: false }) month?: string,
        @QueryParam("year", { required: false }) year?: string,
        @QueryParam("userId", { required: false }) userId?: string
    ) {
        const mealRepository = AppDataSource.getRepository(Meal);

        try {
            const messId = req.messId;
            const whereClause: any = { messId };

            if (month && !isNaN(parseInt(month))) {
                whereClause.month = parseInt(month);
            }

            if (year && !isNaN(parseInt(year))) {
                whereClause.year = parseInt(year);
            }

            if (userId && !isNaN(parseInt(userId))) {
                whereClause.user = { id: parseInt(userId) };
            }

            return await mealRepository.find({ where: whereClause });
        } catch (error: any) {
            throw new Error("Error fetching meals: " + error.message);
        }
    }


    @Post("/recordMeals")
    async recordMeals(@Req() req: any, @Body() meals: { userId: number, day: number, meals: number, month: number, year: number }[]) {
        const mealRepository = AppDataSource.getRepository(Meal);
        const messId = req.messId;

        try {
            for (const mealData of meals) {
                const { userId, day, meals, month, year } = mealData;

                let mealRecord = await mealRepository.findOne({
                    where: { messId, month, year, user: { id: userId } }
                });

                if (!mealRecord) {
                    mealRecord = new Meal();
                    mealRecord.messId = messId;
                    mealRecord.user = { id: userId } as any;
                    mealRecord.month = month;
                    mealRecord.year = year;
                }

                (mealRecord as any)[`day${day}`] = meals;

                await mealRepository.save(mealRecord);
            }

            return { message: "Meals recorded successfully" };
        } catch (error: any) {
            throw new Error("Error recording meals: " + error.message);
        }
    }

}


