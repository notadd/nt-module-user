import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { PERMISSION_DEFINITION } from '../decorators';
import { Permission } from '../entities/permission.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthorizationGurad implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        /**
         * whitelist
         */
        if (['login', 'register'].includes(context.getHandler().name)) {
            return true;
        }

        const gqlCtx = GqlExecutionContext.create(context);

        const user: User = gqlCtx.getContext().user;

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