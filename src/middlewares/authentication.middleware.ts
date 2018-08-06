import { TokenExpiredError } from 'jsonwebtoken';
import * as passport from 'passport';
import * as url from 'url';

export function authentication(req, res, next) {
    // FIXME: 删除 6--16 行
    if (req.body && req.body.operationName === 'IntrospectionQuery') {
        next();
        return;
    }
    // 允许 graphiql 访问所有接口
    const referer = req.headers.referer;
    if (referer && url.parse(referer).pathname.substr(0, 9) === '/graphiql') {
        next();
        return;
    }

    // 登录和注册接口忽略验证
    if (['login', 'register'].indexOf(req.body.operationName) >= 0) {
        next();
        return;
    }

    passport.authenticate('jwt', (error, user, info) => {
        if (info instanceof TokenExpiredError) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ code: 403, message: '授权失败，token 已经过期' }));
        } else if (!user) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ code: 401, message: '授权失败，请检查 token 是否正确' }));
        } else {
            (req as any).user = user;
            next();
        }
    })(req, res);
}
