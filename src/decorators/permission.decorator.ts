import 'reflect-metadata';

export const PERMISSION_DEFINITION = 'user:permission_definition';

export function Permission(options: { name: string, identify: string, action: 'create' | 'delete' | 'update' | 'find', personal?: boolean }) {
    return (target: any, propertyKey: string) => {
        Reflect.defineMetadata(PERMISSION_DEFINITION, options, target, propertyKey);
    };
}