"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
exports.RESOURCE_DEFINITION = '__resource_definition__';
function Resource(options) {
    return (target) => {
        Reflect.defineMetadata(exports.RESOURCE_DEFINITION, options, target);
    };
}
exports.Resource = Resource;
