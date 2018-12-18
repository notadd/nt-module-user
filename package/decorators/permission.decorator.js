"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
exports.PERMISSION_DEFINITION = '__permission_definition__';
function Permission(options) {
    return (target, propertyKey) => {
        Reflect.defineMetadata(exports.PERMISSION_DEFINITION, options, target, propertyKey);
    };
}
exports.Permission = Permission;
