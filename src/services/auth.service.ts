import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { JwtPayload, JwtReply } from '../interfaces/jwt.interface';

@Injectable()
export class AuthService {

    // TODO: 配置有效期
    async createToken(payload: JwtPayload): Promise<JwtReply> {
        const accessToken = jwt.sign(payload, 'secretKey', { expiresIn: '1d' });
        return { accessToken, expiresIn: 60 * 60 * 24 };
    }
}