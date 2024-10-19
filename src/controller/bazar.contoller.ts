import { Body, Delete, Get, JsonController, Param, Post, Put, Req, UseBefore } from "routing-controllers";
import { AppDataSource } from "../datasourse";
import { jwtMiddleware } from "../util/jwt.middleware";
import { Bazar } from "../entity/bazar.model";
import { Mess } from "../entity/mess.model";
import { ApiResponse } from "../util/api.response";
import { Transactional } from "typeorm-transactional";

@JsonController("/api/bazar")
@UseBefore(jwtMiddleware)
export class BazarController {

    @Post("/createBazar")
    async createBazar(@Body() bazarData: Bazar, @Req() req: any): Promise<ApiResponse> {
        const response = new ApiResponse();
        const bazarRepository = AppDataSource.getRepository(Bazar);
        const messRepository = AppDataSource.getRepository(Mess);

        bazarData.messId = req.messId;

        try {
            const mess = await messRepository.findOneOrFail({ where: { id: bazarData.messId } });

            if ((mess.balance ?? 0) < (bazarData.cost ?? 0)) {
                return response.error("Insufficient balance in mess account to pay for the bazar.");
            }

            mess.balance = (mess.balance ?? 0) - (bazarData.cost ?? 0);

            const bazar = bazarRepository.create(bazarData);
            await bazarRepository.save(bazar);
            await messRepository.save(mess);

            response.setData("bazar", bazar);
            return response.success("Bazar created successfully.");
        } catch (error: any) {
            return response.errorFromException(error);
        }
    }

    @Get("/getAllBazars")
    async getAllBazars(@Req() req: any): Promise<ApiResponse> {
        const response = new ApiResponse();
        const bazarRepository = AppDataSource.getRepository(Bazar);

        try {
            const messId = req.messId;
            const bazars = await bazarRepository.find({ where: { messId }, relations: ["user"] });
            response.setData("bazars", bazars);
            return response.success("All bazars fetched successfully.");
        } catch (error: any) {
            return response.errorFromException(error);
        }
    }

    @Get("/getBazarById/:id")
    async getBazarById(@Param("id") id: number, @Req() req: any): Promise<ApiResponse> {
        const response = new ApiResponse();
        const bazarRepository = AppDataSource.getRepository(Bazar);

        try {
            const messId = req.messId;
            const bazar = await bazarRepository.findOneOrFail({ where: { id, messId }, relations: ["user"] });
            response.setData("bazar", bazar);
            return response.success("Bazar fetched successfully.");
        } catch (error: any) {
            return response.error("Bazar not found: " + error.message);
        }
    }

    @Put("/updateBazar/:id")
    @Transactional()
    async updateBazar(@Param("id") id: number, @Body() bazarData: Partial<Bazar>, @Req() req: any): Promise<ApiResponse> {
        const response = new ApiResponse();
        const bazarRepository = AppDataSource.getRepository(Bazar);
        const messRepository = AppDataSource.getRepository(Mess);

        try {
            const messId = req.messId;
            const existingBazar = await bazarRepository.findOneOrFail({ where: { id, messId } });
            const mess = await messRepository.findOneOrFail({ where: { id: messId } });

            mess.balance = (mess.balance ?? 0) + (existingBazar.cost ?? 0);

            if ((mess.balance ?? 0) < (bazarData.cost ?? 0)) {
                return response.error("Insufficient balance in mess account to pay for the updated bazar.");
            }

            mess.balance = (mess.balance ?? 0) - (bazarData.cost ?? 0);

            await bazarRepository.update(id, bazarData);
            await messRepository.save(mess);

            const updatedBazar = await bazarRepository.findOneOrFail({ where: { id, messId }, relations: ["user"] });
            response.setData("bazar", updatedBazar);
            return response.success("Bazar updated successfully.");
        } catch (error: any) {
            return response.errorFromException(error);
        }
    }

    @Delete("/deleteBazar/:id")
    @Transactional()
    async deleteBazar(@Param("id") id: number, @Req() req: any): Promise<ApiResponse> {
        const response = new ApiResponse();
        const bazarRepository = AppDataSource.getRepository(Bazar);
        const messRepository = AppDataSource.getRepository(Mess);

        try {
            const messId = req.messId;
            const bazar = await bazarRepository.findOneOrFail({ where: { id, messId } });
            const mess = await messRepository.findOneOrFail({ where: { id: messId } });

            mess.balance = (mess.balance ?? 0) + (bazar.cost ?? 0);

            await bazarRepository.delete(id);
            await messRepository.save(mess);

            return response.success("Bazar deleted and balance reverted successfully.");
        } catch (error: any) {
            return response.errorFromException(error);
        }
    }
}



