import { User } from '../entities/user.entity';
import { JwtPayload, JwtReply } from '../interfaces/jwt.interface';
import { UserService } from '../services/user.service';
export declare class AuthService {
    private readonly userService;
    constructor(userService: UserService);
    createToken(payload: JwtPayload): Promise<JwtReply>;
    validateUser(req: any): Promise<User>;
}
//# sourceMappingURL=auth.service.d.ts.map