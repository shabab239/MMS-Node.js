import {Body, Delete, Get, JsonController, Param, Post, Put, Req, UseBefore} from "routing-controllers";
import {AppDataSource} from "../datasourse";
import {jwtMiddleware} from "../util/jwt.middleware";
import {User} from "../entity/user.model";
import bcrypt from "bcrypt";


@JsonController("/api/user")
@UseBefore(jwtMiddleware)
export class UserController {

    @Post("/createUser")
    async createUser(@Body() userData: User, @Req() req: any) {
        const userRepository = AppDataSource.getRepository(User);

        userData.password = await bcrypt.hash(userData.password ?? '', 10);
        userData.messId = req.messId;

        const user = userRepository.create(userData);

        try {
            await userRepository.save(user);
            return user;
        } catch (error: any) {
            throw new Error("Error creating user: " + error.message);
        }
    }

    @Get("/getAllUsers")
    async getAllUsers(@Req() req: any) {
        const userRepository = AppDataSource.getRepository(User);

        try {
            const messId = req.messId;
            return await userRepository.find({where: {messId}});
        } catch (error: any) {
            throw new Error("Error fetching users: " + error.message);
        }
    }

    @Get("/getUserById/:id")
    async getUserById(@Param("id") id: number, @Req() req: any) {
        const userRepository = AppDataSource.getRepository(User);

        try {
            const messId = req.messId;
            return await userRepository.findOneOrFail({where: {id, messId}});
        } catch (error: any) {
            throw new Error("User not found: " + error.message);
        }
    }

    @Put("/updateUser/:id")
    async updateUser(@Param("id") id: number, @Body() userData: Partial<User>, @Req() req: any) {
        const userRepository = AppDataSource.getRepository(User);

        try {
            const messId = req.messId;
            await userRepository.findOneOrFail({where: {id, messId}});

            userData.messId = messId;
            await userRepository.update(id, userData);

            return await userRepository.findOneOrFail({where: {id, messId}});
        } catch (error: any) {
            throw new Error("Error updating user: " + error.message);
        }
    }

    @Delete("/deleteUser/:id")
    async deleteUser(@Param("id") id: number, @Req() req: any) {
        const userRepository = AppDataSource.getRepository(User);

        try {
            const messId = req.messId;
            await userRepository.findOneOrFail({where: {id, messId}});
            await userRepository.delete(id);
        } catch (error: any) {
            throw new Error("Error deleting user: " + error.message);
        }
    }
}


