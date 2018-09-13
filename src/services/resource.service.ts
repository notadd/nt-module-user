import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Not, Repository } from 'typeorm';

import { Permission } from '../entities/permission.entity';
import { Resource } from '../entities/resource.entity';

@Injectable()
export class ResourceService {
    constructor(
        @InjectEntityManager() private readonly entityManager: EntityManager,
        @InjectRepository(Resource) private readonly resourceRepo: Repository<Resource>,
        @InjectRepository(Permission) private readonly permissionRepo: Repository<Permission>
    ) { }

    async saveResourcesAndPermissions(payload: string) {
        const metadataMap: Map<string, { resource: Resource, permissions: Permission[] }> = new Map();
        const obj = JSON.parse(payload);
        Object.keys(obj).forEach(k => metadataMap.set(k, obj[k]));

        // All resource annotations and all permission annotations that were scanned
        const scannedResourcesAndPermissions = [...metadataMap.values()].map(metadataValue => {
            // Bind permissions to the corresponding resource
            metadataValue.permissions.forEach(v => v.resource = metadataValue.resource);
            return { permissions: metadataValue.permissions, resource: metadataValue.resource };
        });

        // All resource annotations that were scanned
        const scannedResources = scannedResourcesAndPermissions.map(v => v.resource);

        // Remove the resources and their permissions which were removed from the annotation
        const resourceIdentifies = [...metadataMap.keys()].length === 0 ? ['__delete_all_resource__'] : [...metadataMap.keys()];
        const notExistResources = await this.resourceRepo.find({ where: { identify: Not(In(resourceIdentifies)) } });
        if (notExistResources.length > 0) await this.resourceRepo.delete(notExistResources.map(v => v.id));
        // Filter out the new resources
        const existResources = await this.resourceRepo.find({ order: { id: 'ASC' } });
        const newResourcess = scannedResources.filter(sr => !existResources.map(v => v.identify).includes(sr.identify));
        // Save the new resources
        if (newResourcess.length > 0) await this.entityManager.insert(Resource, this.resourceRepo.create(newResourcess));

        // All permission annotations that were scanned
        const scannedPermissions = <Permission[]>[].concat(...scannedResourcesAndPermissions.map(v => v.permissions));
        // Query the resources of all the permission annotations scanned
        const resource = await this.resourceRepo.find({ where: { identify: In(scannedPermissions.map(v => v.resource.identify)) } });
        // Bind resources to permissions
        scannedPermissions.forEach(permission => {
            permission.resource = resource.find(v => v.identify === permission.resource.identify);
        });
        // Remove the permissions that were removed from annotations
        // tslint:disable-next-line:max-line-length
        const permissionIdentifies = scannedPermissions.map(v => v.identify).length === 0 ? ['__delete_all_permission__'] : scannedPermissions.map(v => v.identify);
        const notExistPermissions = await this.permissionRepo.find({ where: { identify: Not(In(permissionIdentifies)) } });
        if (notExistPermissions.length > 0) await this.permissionRepo.delete(notExistPermissions.map(v => v.id));
        // Filter out the new permissions
        const existPermissions = await this.permissionRepo.find({ order: { id: 'ASC' } });
        const newPermissions = scannedPermissions.filter(sp => !existPermissions.map(v => v.identify).includes(sp.identify));
        // Save the new permissions
        if (newPermissions.length > 0) await this.entityManager.insert(Permission, this.permissionRepo.create(newPermissions));
    }

    async findResources() {
        return this.resourceRepo.find({ relations: ['permissions'] });
    }
}