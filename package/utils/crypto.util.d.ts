export declare class CryptoUtil {
    encryptPassword(password: string): Promise<string>;
    checkPassword(password: string, passwordHash: string): Promise<boolean>;
}
