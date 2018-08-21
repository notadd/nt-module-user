import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { PERMISSION_DEFINITION } from '../decorators';
import { Permission } from '../entities/permission.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthenticationGurad implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        // 登录和注册接口忽略验证
        if (['login', 'register'].includes(context.getHandler().name)) {
            return true;
        }

        let user: User;
        context.getArgs().forEach(arg => {
            if (arg && arg.user) {
                user = arg.user;
            }
        });

        if (user.username === 'sadmin') {
            return true;
        }

        const userPerm: string[] = [];
        user.roles.forEach(role => {
            role.permissions.forEach(permission => {
                userPerm.push(permission.identify);
            });
        });
        const handlerPerm = <Permission>Reflect.getMetadata(PERMISSION_DEFINITION, context.getClass().prototype, context.getHandler().name);
        if (handlerPerm && !userPerm.includes(handlerPerm.identify)) {
            return false;
        }
        return true;
    }
}