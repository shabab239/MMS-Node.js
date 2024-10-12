import {Body, Delete, Get, JsonController, Param, Post, Put, Req, UseBefore} from "routing-controllers";
import {AppDataSource} from "../datasourse";
import {jwtMiddleware} from "../util/jwt.middleware";
import {Bazar} from "../entity/bazar.model";
import {Mess} from "../entity/mess.model";

@JsonController("/api/bazar")
@UseBefore(jwtMiddleware)
export class BazarController {

    @Post("/createBazar")
    async createBazar(@Body() bazarData: Bazar, @Req() req: any) {
        const bazarRepository = AppDataSource.getRepository(Bazar);
        const messRepository = AppDataSource.getRepository(Mess);

        bazarData.messId = req.messId;

        try {
            const mess = await messRepository.findOneOrFail({where: {id: bazarData.messId}});

            if ((mess.balance ?? 0) < (bazarData.cost ?? 0)) {
                return {message: "Insufficient balance in mess account to pay for the bazar"};
            }

            mess.balance = (mess.balance ?? 0) - (bazarData.cost ?? 0);

            const bazar = bazarRepository.create(bazarData);
            await bazarRepository.save(bazar);
            await messRepository.save(mess);

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
        const messRepository = AppDataSource.getRepository(Mess);

        try {
            const messId = req.messId;
            const existingBazar = await bazarRepository.findOneOrFail({where: {id, messId}});
            const mess = await messRepository.findOneOrFail({where: {id: messId}});

            mess.balance = (mess.balance ?? 0) + (existingBazar.cost ?? 0);

            if ((mess.balance ?? 0) < (bazarData.cost ?? 0)) {
                return {message: "Insufficient balance in mess account to pay for the updated bazar"};
            }

            mess.balance = (mess.balance ?? 0) - (bazarData.cost ?? 0);

            await bazarRepository.update(id, bazarData);
            await messRepository.save(mess);

            return await bazarRepository.findOneOrFail({where: {id, messId}});
        } catch (error: any) {
            throw new Error("Error updating bazar: " + error.message);
        }
    }

    @Delete("/deleteBazar/:id")
    async deleteBazar(@Param("id") id: number, @Req() req: any) {
        const bazarRepository = AppDataSource.getRepository(Bazar);
        const messRepository = AppDataSource.getRepository(Mess);

        try {
            const messId = req.messId;
            const bazar = await bazarRepository.findOneOrFail({where: {id, messId}});
            const mess = await messRepository.findOneOrFail({where: {id: messId}});

            mess.balance = (mess.balance ?? 0) + (bazar.cost ?? 0);

            await bazarRepository.delete(id);
            await messRepository.save(mess);

            return {message: "Bazar deleted and balance reverted successfully"};
        } catch (error: any) {
            throw new Error("Error deleting bazar: " + error.message);
        }
    }
}


