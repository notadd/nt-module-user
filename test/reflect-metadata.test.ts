import 'reflect-metadata';

import { MetadataScanner } from '@nestjs/core/metadata-scanner';

export const SOURCE_DEFINITION = 'user:source_definition';
export const PERMISSION_DEFINITION = 'user:permission_definition';

function Source(options: { name: string, identify: string, permissions: ('create' | 'delete' | 'update' | 'find')[] }) {
    return (target: any) => {
        // console.log('target: ', target);
        Reflect.defineMetadata(SOURCE_DEFINITION, options, target);
    };
}

function Permission(options: { name: string, action: 'create' | 'delete' | 'update' | 'find', personal?: boolean }) {
    return (target: any, propertyKey: string) => {
        // console.log('name: ', options.name);
        // console.log('action: ', options.action);
        // console.log('target: ', target);
        // console.log('propertyKey: ', propertyKey);
        // console.log('descriptor: ', descriptor);
        Reflect.defineMetadata(PERMISSION_DEFINITION, options, target, propertyKey);
    };
}

@Source({ name: '角色管理', identify: 'role', permissions: ['create', 'delete', 'update', 'find'] })
class RoleService {
    @Permission({ name: '添加角色', action: 'create' })
    createRole() {

    }
}

const metadataScanner = new MetadataScanner();

new RoleService().createRole();

console.log(Reflect.getMetadata(SOURCE_DEFINITION, RoleService));

// console.log(Reflect.getMetadata(PERMISSION_DEFINITION, RoleService.prototype, 'createRole'));

const prototype = Object.getPrototypeOf(new RoleService());
metadataScanner.scanFromPrototype(RoleService, prototype, name => {
    console.log(Reflect.getMetadata(PERMISSION_DEFINITION, RoleService.prototype, name));
});