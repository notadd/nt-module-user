import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

/**
 * 加密工具
 */
@Injectable()
export class CryptoUtil {

    /**
     * 加密密码
     *
     * @param password 密码
     */
    async encryptPassword(password: string): Promise<string> {
        return bcrypt.hash(password, bcrypt.genSaltSync());
    }
}