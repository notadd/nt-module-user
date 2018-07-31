export interface JwtPayload {
    username: string;
    options?: any;
}

export interface JwtReply {
    token: string;
    expiresIn: number;
}