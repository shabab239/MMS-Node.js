import {Body, Delete, Get, JsonController, Param, Post, Put, Req, UseBefore} from "routing-controllers";
import {AppDataSource} from "../datasourse";
import {User} from "../entity/user.model";
import {jwtMiddleware} from "../util/jwt.middleware";
import {ApiResponse} from "../util/api.response";
import bcrypt from "bcrypt";


@JsonController("/api/user")
@UseBefore(jwtMiddleware)
export class UserController {

    @Post("/createUser")
    async createUser(@Body() userData: User, @Req() req: any) {
        const response = new ApiResponse();
        userData.password = await bcrypt.hash(userData.password ?? '', 10);
        userData.messId = req.messId;

        const userRepository = AppDataSource.getRepository(User);
        const user = userRepository.create(userData);

        try {
            await userRepository.save(user);
            response.setData("user", user);
            response.success("User created successfully");
            return response;
        } catch (error: any) {
            return response.errorFromException(error);
        }
    }

    @Get("/getAllUsers")
    async getAllUsers(@Req() req: any) {
        const response = new ApiResponse();
        const userRepository = AppDataSource.getRepository(User);

        try {
            const messId = req.messId;
            const users = await userRepository.find({ where: { messId } });
            response.setData("users", users);
            response.success("Users fetched successfully");
            return response;
        } catch (error: any) {
            return response.errorFromException(error);
        }
    }

    @Get("/getUserById/:id")
    async getUserById(@Param("id") id: number, @Req() req: any) {
        const response = new ApiResponse();
        const userRepository = AppDataSource.getRepository(User);

        try {
            const messId = req.messId;
            const user = await userRepository.findOneOrFail({ where: { id, messId } });
            response.setData("user", user);
            response.success("User found successfully");
            return response;
        } catch (error: any) {
            return response.errorFromException(error);
        }
    }

    @Put("/updateUser")
    async updateUser(@Body() userData: User, @Req() req: any) {
        const response = new ApiResponse();
        const userRepository = AppDataSource.getRepository(User);

        try {
            const messId = req.messId;
            const id = userData.id;
            await userRepository.findOneOrFail({ where: { id, messId } });
            await userRepository.save(userData);
            const updatedUser = await userRepository.findOneOrFail({ where: { id, messId } });
            response.setData("user", updatedUser);
            response.success("User updated successfully");
            return response;
        } catch (error: any) {
            return response.errorFromException(error);
        }
    }

    @Delete("/deleteUser/:id")
    async deleteUser(@Param("id") id: number, @Req() req: any) {
        const response = new ApiResponse();
        const userRepository = AppDataSource.getRepository(User);

        try {
            const messId = req.messId;
            await userRepository.findOneOrFail({ where: { id, messId } });
            await userRepository.delete(id);
            response.success("User deleted successfully");
            return response;
        } catch (error: any) {
            return response.errorFromException(error);
        }
    }
}

