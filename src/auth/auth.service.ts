import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { User } from '../entities';
import { JwtPayload, JwtReply } from '../interfaces';
import { UserService } from '../services/user.service';

@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UserService)) private readonly userService: UserService
    ) { }

    async createToken(payload: JwtPayload): Promise<JwtReply> {
        /**
         * TODO: 令牌有效期问题：
         *
         * 使用刷新令牌机制，即第一次创建 accessToken 时，返回 accessToken 和 refreshToken，
         * 当 accessToken 过期时用 refreshToken 刷新获取新的 accessToken，
         * 当 refreToken 过期时，需要重新登录获取 accessToken 和 refreshToken。
         *
         * TODO: 签名秘钥，由安装用户模块的应用管理，在 import 时作为参数传递
         */
        const accessToken = jwt.sign(payload, 'secretKey', { expiresIn: 7200 });

        return { accessToken, expiresIn: 7200 };
    }

    // TODO: 如果用户模块启用了缓存选项，则在缓存中通过 username 查询权限集，否则查数据库中的权限集
    async validateUser(payload: JwtPayload): Promise<User | undefined> {
        return this.userService.findUserWithRelations(payload.username);
    }
}