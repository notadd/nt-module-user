"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const decorators_1 = require("../decorators");
let AuthGurad = class AuthGurad {
    async canActivate(context) {
        const gqlCtx = graphql_1.GqlExecutionContext.create(context);
        const user = gqlCtx.getContext().user;
        if (user && user.username === 'sadmin')
            return true;
        const userPerm = [];
        user && user.roles.forEach(role => {
            role.permissions.forEach(permission => {
                userPerm.push(permission.identify);
            });
        });
        const handlerPerm = Reflect.getMetadata(decorators_1.PERMISSION_DEFINITION, context.getClass().prototype, context.getHandler().name);
        if (handlerPerm && !userPerm.includes(handlerPerm.identify)) {
            return false;
        }
        return true;
    }
};
AuthGurad = __decorate([
    common_1.Injectable()
], AuthGurad);
exports.AuthGurad = AuthGurad;

//# sourceMappingURL=auth.gurad.js.map
