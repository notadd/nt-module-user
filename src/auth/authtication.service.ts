import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AuthenticationError } from 'apollo-server-core';
import * as jwt from 'jsonwebtoken';

import { User } from '../entities/user.entity';
import { JwtPayload, JwtReply } from '../interfaces/jwt.interface';
import { UserService } from '../services/user.service';

@Injectable()
export class AuthenticationService {
    constructor(
        @Inject(forwardRef(() => UserService)) private readonly userService: UserService
    ) { }

    async createToken(payload: JwtPayload): Promise<JwtReply> {
        const accessToken = jwt.sign(payload, 'secretKey', { expiresIn: '1d' });
        return { accessToken, expiresIn: 60 * 60 * 24 };
    }

    async validateUser(req: any): Promise<User> {
        /**
         * Authentication whitelist
         */
        if (req.body && ['IntrospectionQuery', 'login', 'register'].includes(req.body.operationName)) {
            return;
        }

        let token = req.headers.authentication as string;
        if (!token) {
            throw new AuthenticationError(`Request header lacks authentication parameters，it should be: 'authentication' or 'Authentication'`);
        }

        if (['Bearer ', 'bearer '].includes(token.slice(0, 7))) {
            token = token.slice(7);
        } else {
            throw new AuthenticationError(`The authentication code prefix is incorrect. it should be: 'Bearer ' or 'bearer '`);
        }

        try {
            const decodedToken = <{ username: string }>jwt.verify(token, 'secretKey');
            return this.userService.findOneWithRolesAndPermissions(decodedToken.username);
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new AuthenticationError('The authentication code is incorrect');
            }
            if (error instanceof jwt.TokenExpiredError) {
                throw new AuthenticationError('The authentication code has expired');
            }
        }
    }
}