import { Transport } from '@nestjs/common/enums/transport.enum';
import { NestFactory } from '@nestjs/core';
import { join } from 'path';

import { UserModule } from './user.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice(UserModule.forRoot({ i18n: 'zh-CN' }), {
        transport: Transport.GRPC,
        options: {
            url: '0.0.0.0' + ':50051',
            package: 'notadd_module_user',
            protoPath: join(__dirname, 'protobufs/user-module.proto'),
            loader: {
                arrays: true
            }
        }
    });

    await app.listenAsync();
}

bootstrap();