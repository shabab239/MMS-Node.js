import {Body, Delete, Get, JsonController, Param, Post, Put, Req, UseBefore} from "routing-controllers";
import {AppDataSource} from "../datasourse";
import {jwtMiddleware} from "../util/jwt.middleware";
import {Bazar} from "../entity/bazar.model";


@JsonController("/api/bazar")
@UseBefore(jwtMiddleware)
export class BazarController {

    @Post("/createBazar")
    async createBazar(@Body() bazarData: Bazar, @Req() req: any) {
        const bazarRepository = AppDataSource.getRepository(Bazar);

        bazarData.messId = req.messId;
        const bazar = bazarRepository.create(bazarData);

        try {
            await bazarRepository.save(bazar);
            return bazar;
        } catch (error: any) {
            throw new Error("Error creating bazar: " + error.message);
        }
    }

    @Get("/getAllBazars")
    async getAllBazars(@Req() req: any) {
        const bazarRepository = AppDataSource.getRepository(Bazar);

        try {
            const messId = req.messId;
            return await bazarRepository.find({where: {messId}});
        } catch (error: any) {
            throw new Error("Error fetching bazars: " + error.message);
        }
    }

    @Get("/getBazarById/:id")
    async getBazarById(@Param("id") id: number, @Req() req: any) {
        const bazarRepository = AppDataSource.getRepository(Bazar);

        try {
            const messId = req.messId;
            return await bazarRepository.findOneOrFail({where: {id, messId}});
        } catch (error: any) {
            throw new Error("Bazar not found: " + error.message);
        }
    }

    @Put("/updateBazar/:id")
    async updateBazar(@Param("id") id: number, @Body() bazarData: Partial<Bazar>, @Req() req: any) {
        const bazarRepository = AppDataSource.getRepository(Bazar);

        try {
            const messId = req.messId;
            await bazarRepository.findOneOrFail({where: {id, messId}});

            bazarData.messId = messId;
            await bazarRepository.update(id, bazarData);

            return await bazarRepository.findOneOrFail({where: {id, messId}});
        } catch (error: any) {
            throw new Error("Error updating bazar: " + error.message);
        }
    }

    @Delete("/deleteBazar/:id")
    async deleteBazar(@Param("id") id: number, @Req() req: any) {
        const bazarRepository = AppDataSource.getRepository(Bazar);

        try {
            const messId = req.messId;
            await bazarRepository.findOneOrFail({where: {id, messId}});
            await bazarRepository.delete(id);
        } catch (error: any) {
            throw new Error("Error deleting bazar: " + error.message);
        }
    }
}


