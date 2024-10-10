import {Body, JsonController, Post} from "routing-controllers";
import bcrypt from "bcrypt";
import {AppDataSource} from "../datasourse";
import {User} from "../entity/user.model";
import {generateToken} from "../util/jwt.util";

@JsonController("/api/auth")
export class AuthController {

    @Post("/login")
    async login(@Body() body: { cell: string; password: string }) {
        const {cell, password} = body;

        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({where: {cell}});

        if (!user) {
            return {status: 404, message: "User not found"};
        }

        const isPasswordValid = await bcrypt.compare(password, user.password ?? '');
        if (!isPasswordValid) {
            return {status: 401, message: "Invalid password"};
        }

        const token = generateToken(user.id, user.messId);
        return {token};
    }

}
