import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { JwtPayload, JwtReply } from '../interfaces';

@Injectable()
export class AuthService {
    constructor() { }
    async createToken(payload: JwtPayload): Promise<JwtReply> {
        /**
         * TODO: 令牌有效期问题：
         *
         * 使用刷新令牌机制，即第一次创建token时，返回 token 和 refresh_token，
         * 当 token 过期时用 refresh_token 刷新获取新的 token，
         * 当 refre_token 过期时，需要重新登录获取 token 和 refresh_token。
         *
         * TODO: token 签名秘钥，由安装用户模块的应用管理，在 import 时作为参数传递
         */
        const token = jwt.sign(payload, 'secretKey', { expiresIn: 3600 });

        return { token, expiresIn: 3600 };
    }

}