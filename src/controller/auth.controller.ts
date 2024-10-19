import { Body, JsonController, Post, UseBefore } from "routing-controllers";
import bcrypt from "bcrypt";
import { AppDataSource } from "../datasourse";
import { User } from "../entity/user.model";
import { generateToken } from "../util/jwt.util";
import { ApiResponse } from "../util/api.response";
import { Mess } from "../entity/mess.model";
import { jwtMiddleware } from "../util/jwt.middleware";

@JsonController("/api/auth")
export class AuthController {

    @Post("/login")
    async login(@Body() body: { cell: string; password: string }) {
        const { cell, password } = body;
        const userRepo = AppDataSource.getRepository(User);
        const messRepo = AppDataSource.getRepository(Mess);
        const response = new ApiResponse();

        try {
            const user = await userRepo.findOne({ where: { cell } });

            if (!user) {
                return response.error("User not found");
            }

            const isPasswordValid = await bcrypt.compare(password, user.password ?? '');
            if (!isPasswordValid) {
                return response.error("Invalid password");
            }

            const messId = user.messId ?? 0;
            const mess = await messRepo.findOneOrFail({ where: { id: messId } });

            const token = generateToken(user.id, user.messId);
            response.setData("token", token);
            response.setData("user", user);
            response.setData("mess", mess);
            response.success("Login successful");
            return response;
        } catch (error: any) {
            return response.errorFromException(error);
        }
    }

    @Post("/isLoggedIn")
    @UseBefore(jwtMiddleware)
    async isLoggedIn() {
        const response = new ApiResponse();
        response.success("Login successful");
        return response;
    }

}
