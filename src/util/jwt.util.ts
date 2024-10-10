import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

export const generateToken = (userId?: number, messId?: number) => {
    const payload = {userId, messId};
    return jwt.sign(payload, JWT_SECRET, {expiresIn: '1h'});
};
