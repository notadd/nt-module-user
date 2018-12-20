import { User } from '../entities/user.entity';
import { JwtPayload, JwtReply } from '../interfaces/jwt.interface';
import { UserService } from '../services/user.service';
export declare class AuthService {
    private readonly userService;
    private readonly authTokenWhiteList;
    private readonly authTokenExpiresIn;
    constructor(userService: UserService, authTokenWhiteList: string[], authTokenExpiresIn: number);
    createToken(payload: JwtPayload): Promise<JwtReply>;
    validateUser(token: string, operationName: string): Promise<User>;
}
