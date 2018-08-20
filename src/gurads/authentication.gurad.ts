import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { AuthService } from '../authentication/authentication.service';
import { PERMISSION_DEFINITION } from '../decorators';
import { Permission } from '../entities/permission.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthenticationGurad implements CanActivate {

    constructor(@Inject(AuthService) private readonly authService: AuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // 登录和注册接口忽略验证
        if (['login', 'register'].indexOf(context.getHandler().name) >= 0) {
            return true;
        }

        let token: string;
        context.getArgs().forEach(arg => {
            if (arg && arg.token) {
                token = arg.token;
            }
        });

        let user: User;
        try {
            const decodedToken = <{ username: string }>jwt.verify(token, 'secretKey');
            user = await this.authService.validateUser({ username: decodedToken.username });
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new UnauthorizedException('授权失败，请检查 token 是否正确');
            }
            if (error instanceof jwt.TokenExpiredError) {
                throw new UnauthorizedException('授权失败，token 已经过期');
            }
        }

        const userPerm: string[] = [];
        user.roles.forEach(role => {
            role.permissions.forEach(permission => {
                userPerm.push(permission.identify);
            });
        });
        const handlerPerm = <Permission>Reflect.getMetadata(PERMISSION_DEFINITION, context.getClass().prototype, context.getHandler().name);
        if (handlerPerm && userPerm.includes(handlerPerm.identify)) {
            return false;
        }
        return true;
    }
}