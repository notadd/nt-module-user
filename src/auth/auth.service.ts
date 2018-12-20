import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AuthenticationError } from 'apollo-server-core';
import { __ as t } from 'i18n';
import * as jwt from 'jsonwebtoken';

import { AUTH_TOKEN_EXPIRES_IN, AUTH_TOKEN_WHITE_LIST } from '../constants/auth.constant';
import { User } from '../entities/user.entity';
import { JwtPayload, JwtReply } from '../interfaces/jwt.interface';
import { UserService } from '../services/user.service';

@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
        @Inject(AUTH_TOKEN_WHITE_LIST) private readonly authTokenWhiteList: string[],
        @Inject(AUTH_TOKEN_EXPIRES_IN) private readonly authTokenExpiresIn: number
    ) { }

    async createToken(payload: JwtPayload): Promise<JwtReply> {
        const accessToken = jwt.sign(payload, 'secretKey', { expiresIn: this.authTokenExpiresIn });
        return { accessToken, expiresIn: this.authTokenExpiresIn };
    }

    async validateUser(token: string, operationName: string): Promise<User> {
        if (this.authTokenWhiteList.some(item => item === operationName)) {
            return;
        }

        if (!token) {
            throw new AuthenticationError(t('Request header lacks authorization parameters，it should be: Authorization'));
        }

        if (token.slice(0, 6) === 'Bearer') {
            token = token.slice(7);
        } else {
            throw new AuthenticationError(t('The authorization code prefix is incorrect. it should be: Bearer'));
        }

        try {
            const decodedToken = <{ loginName: string }>jwt.verify(token, 'secretKey');
            return this.userService.findOneWithRolesAndPermissions(decodedToken.loginName);
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new AuthenticationError(t('The authorization code is incorrect'));
            }
            if (error instanceof jwt.TokenExpiredError) {
                throw new AuthenticationError(t('The authorization code has expired'));
            }
        }
    }
}