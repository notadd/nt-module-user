export interface JwtPayload {
    username: string;
    options?: any;
}

export interface JwtReply {
    accessToken: string;
    expiresIn: number;
}