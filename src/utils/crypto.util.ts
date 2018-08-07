import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

/**
 * 加解密工具
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

    /**
     * 检查密码是否正确
     *
     * @param password 明文密码
     * @param passwordHash 密文密码
     */
    async checkPassword(password: string, passwordHash: string): Promise<boolean> {
        return bcrypt.compare(password, passwordHash);
    }
}