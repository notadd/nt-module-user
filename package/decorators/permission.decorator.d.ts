import 'reflect-metadata';
export declare const PERMISSION_DEFINITION = "__permission_definition__";
export declare function Permission(options: {
    name: string;
    identify: string;
    action: 'create' | 'delete' | 'update' | 'find';
}): (target: any, propertyKey: string) => void;
//# sourceMappingURL=permission.decorator.d.ts.map