import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { PERMISSION_DEFINITION } from '../decorators/permission.decorator';
import { Permission } from '../entities/permission.entity';
import { User } from '../entities/user.entity';


@Injectable()
export class AuthenticationGurad implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        // 登录和注册接口忽略验证
        if (['login', 'register'].indexOf(context.getHandler().name) >= 0) {
            return true;
        }

        const user = <User>context.switchToHttp().getRequest().user;
        const userPerm: string[] = [];
        user.roles.forEach(role => {
            role.permissions.forEach(permission => {
                userPerm.push(permission.identify);
            });
        });
        const handlerPerm = <Permission>Reflect.getMetadata(PERMISSION_DEFINITION, context.getClass().prototype, context.getHandler().name);
        if (handlerPerm && userPerm.indexOf(handlerPerm.identify) === -1) {
            return false;
        }
        return true;
    }
}