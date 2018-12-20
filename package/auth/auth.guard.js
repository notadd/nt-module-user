"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const decorators_1 = require("../decorators");
const auth_service_1 = require("./auth.service");
let AuthGuard = class AuthGuard {
    constructor(authService) {
        this.authService = authService;
    }
    async canActivate(context) {
        const gqlCtx = graphql_1.GqlExecutionContext.create(context);
        const req = gqlCtx.getContext().req;
        const operationName = gqlCtx.getInfo().fieldName;
        const token = req.headers.authorization;
        const user = await this.authService.validateUser(token, operationName);
        gqlCtx.getContext().user = user;
        if (user && user.username === 'sadmin')
            return true;
        const userPerm = [];
        if (user && user.roles.length) {
            user.roles.forEach(role => {
                if (role.permissions && role.permissions.length) {
                    role.permissions.forEach(permission => {
                        userPerm.push(permission.identify);
                    });
                }
            });
        }
        const handlerPerm = Reflect.getMetadata(decorators_1.PERMISSION_DEFINITION, context.getClass().prototype, context.getHandler().name);
        if (handlerPerm && !userPerm.includes(handlerPerm.identify)) {
            return false;
        }
        return true;
    }
};
AuthGuard = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject(auth_service_1.AuthService)),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthGuard);
exports.AuthGuard = AuthGuard;
