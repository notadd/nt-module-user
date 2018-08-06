import 'reflect-metadata';

export const RESOURCE_DEFINITION = 'user:resource_definition';

export function Resource(options: { name: string, identify: string }) {
    return (target: any) => {
        Reflect.defineMetadata(RESOURCE_DEFINITION, options, target);
    };
}