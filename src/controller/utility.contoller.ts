import {Body, Delete, Get, JsonController, Param, Post, Req, UseBefore} from "routing-controllers";
import {AppDataSource} from "../datasourse";
import {jwtMiddleware} from "../util/jwt.middleware";
import {Utility} from "../entity/utility.model";
import {Mess} from "../entity/mess.model";


@JsonController("/api/utility")
@UseBefore(jwtMiddleware)
export class UtilityController {

    @Post("/createUtility")
    async createUtility(@Body() utilityData: Utility, @Req() req: any) {
        const utilityRepository = AppDataSource.getRepository(Utility);
        const messRepository = AppDataSource.getRepository(Mess);

        utilityData.messId = req.messId;

        try {
            const mess = await messRepository.findOneOrFail({where: {id: utilityData.messId}});

            if ((mess.balance ?? 0) < (utilityData.cost ?? 0)) {
                return {message: "Insufficient balance in mess account to pay for the utility"};
            }

            mess.balance = (mess.balance ?? 0) - (utilityData.cost ?? 0);

            const utility = utilityRepository.create(utilityData);
            await utilityRepository.save(utility);
            await messRepository.save(mess);

            return utility;
        } catch (error: any) {
            throw new Error("Error creating utility: " + error.message);
        }
    }

    @Get("/getAllUtilities")
    async getAllUtilities(@Req() req: any) {
        const utilityRepository = AppDataSource.getRepository(Utility);

        try {
            const messId = req.messId;
            return await utilityRepository.find({where: {messId}});
        } catch (error: any) {
            throw new Error("Error fetching utilities: " + error.message);
        }
    }

    @Get("/getUtilityById/:id")
    async getUtilityById(@Param("id") id: number, @Req() req: any) {
        const utilityRepository = AppDataSource.getRepository(Utility);

        try {
            const messId = req.messId;
            return await utilityRepository.findOneOrFail({where: {id, messId}});
        } catch (error: any) {
            throw new Error("Utility not found: " + error.message);
        }
    }

    @Delete("/deleteUtility/:id")
    async deleteUtility(@Param("id") id: number, @Req() req: any) {
        const utilityRepository = AppDataSource.getRepository(Utility);
        const messRepository = AppDataSource.getRepository(Mess);

        try {
            const messId = req.messId;

            const utility = await utilityRepository.findOneOrFail({where: {id, messId}});
            const mess = await messRepository.findOneOrFail({where: {id: messId}});

            mess.balance = (mess.balance ?? 0) + (utility.cost ?? 0);

            await utilityRepository.delete(id);
            await messRepository.save(mess);

            return {message: "Utility deleted and balance reverted successfully"};
        } catch (error: any) {
            throw new Error("Error deleting utility: " + error.message);
        }
    }

    /*@Put("/updateUtility/:id")
    async updateUtility(@Param("id") id: number, @Body() utilityData: Partial<Utility>, @Req() req: any) {
        const utilityRepository = AppDataSource.getRepository(Utility);

        try {
            const messId = req.messId;
            await utilityRepository.findOneOrFail({where: {id, messId}});

            utilityData.messId = messId;
            await utilityRepository.update(id, utilityData);

            return await utilityRepository.findOneOrFail({where: {id, messId}});
        } catch (error: any) {
            throw new Error("Error updating utility: " + error.message);
        }
    }*/

}


