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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const apollo_server_core_1 = require("apollo-server-core");
const i18n_1 = require("i18n");
const jwt = __importStar(require("jsonwebtoken"));
const auth_constant_1 = require("../constants/auth.constant");
const user_service_1 = require("../services/user.service");
let AuthService = class AuthService {
    constructor(userService, authTokenWhiteList) {
        this.userService = userService;
        this.authTokenWhiteList = authTokenWhiteList;
    }
    async createToken(payload) {
        const accessToken = jwt.sign(payload, 'secretKey', { expiresIn: '1d' });
        return { accessToken, expiresIn: 60 * 60 * 24 };
    }
    async validateUser(req) {
        if (req.body && this.authTokenWhiteList.some(item => req.body.query.includes(item))) {
            return;
        }
        let token = req.headers.authorization;
        if (!token) {
            throw new apollo_server_core_1.AuthenticationError(i18n_1.__('Request header lacks authorization parameters，it should be: Authorization'));
        }
        if (token.slice(0, 6) === 'Bearer') {
            token = token.slice(7);
        }
        else {
            throw new apollo_server_core_1.AuthenticationError(i18n_1.__('The authorization code prefix is incorrect. it should be: Bearer'));
        }
        try {
            const decodedToken = jwt.verify(token, 'secretKey');
            return this.userService.findOneWithRolesAndPermissions(decodedToken.loginName);
        }
        catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new apollo_server_core_1.AuthenticationError(i18n_1.__('The authorization code is incorrect'));
            }
            if (error instanceof jwt.TokenExpiredError) {
                throw new apollo_server_core_1.AuthenticationError(i18n_1.__('The authorization code has expired'));
            }
        }
    }
};
AuthService = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject(common_1.forwardRef(() => user_service_1.UserService))),
    __param(1, common_1.Inject(auth_constant_1.AUTH_TOKEN_WHITE_LIST)),
    __metadata("design:paramtypes", [user_service_1.UserService, Array])
], AuthService);
exports.AuthService = AuthService;
