import {Body, Delete, Get, JsonController, Param, Post, Put, Req, UseBefore} from "routing-controllers";
import {AppDataSource} from "../datasourse";
import {jwtMiddleware} from "../util/jwt.middleware";
import {Utility} from "../entity/utility.model";


@JsonController("/api/utility")
@UseBefore(jwtMiddleware)
export class UtilityController {

    @Post("/createUtility")
    async createUtility(@Body() utilityData: Utility, @Req() req: any) {
        const utilityRepository = AppDataSource.getRepository(Utility);

        utilityData.messId = req.messId;
        const utility = utilityRepository.create(utilityData);

        try {
            await utilityRepository.save(utility);
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
            throw new Error("Error fetching utilitys: " + error.message);
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

    @Put("/updateUtility/:id")
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
    }

    @Delete("/deleteUtility/:id")
    async deleteUtility(@Param("id") id: number, @Req() req: any) {
        const utilityRepository = AppDataSource.getRepository(Utility);

        try {
            const messId = req.messId;
            await utilityRepository.findOneOrFail({where: {id, messId}});
            await utilityRepository.delete(id);
        } catch (error: any) {
            throw new Error("Error deleting utility: " + error.message);
        }
    }
}


