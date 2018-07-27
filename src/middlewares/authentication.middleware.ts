import { Injectable, MiddlewareFunction, NestMiddleware } from '@nestjs/common';
import * as passport from 'passport';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    resolve(): MiddlewareFunction {
        return (req, res, next) => {
            passport.authenticate('jwt');
        };
    }
}