import { Transport } from '@nestjs/common/enums/transport.enum';
import { NestFactory } from '@nestjs/core';
import { join } from 'path';

import { UserModule } from './user.module';

async function bootstrap() {
    const app = await NestFactory.create(UserModule.forRoot({ i18n: 'zh-CN' }));

    app.connectMicroservice({
        transport: Transport.GRPC,
        options: {
            url: '0.0.0.0' + ':50051',
            package: 'notadd_module_user',
            protoPath: join(__dirname, '../src/protobufs/user-module.proto'),
            loader: {
                arrays: true,
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            }
        }
    });
    await app.startAllMicroservicesAsync();
}

bootstrap();