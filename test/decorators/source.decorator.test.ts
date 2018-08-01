export const SOURCE_DEFINITION = 'user:source_definition';

export function Source(options: { name: string, identify: string }) {
    return (target: any) => {
        Reflect.defineMetadata(SOURCE_DEFINITION, options, target);
    };
}