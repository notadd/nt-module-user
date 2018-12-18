import { Repository } from 'typeorm';
import { InfoGroup } from '../entities/info-group.entity';
import { EntityCheckService } from './entity-check.service';
export declare class InfoGroupService {
    private readonly infoGroupRepo;
    private readonly entityCheckService;
    constructor(infoGroupRepo: Repository<InfoGroup>, entityCheckService: EntityCheckService);
    create(name: string, roleId: number): Promise<void>;
    addInfoItem(infoGroupId: number, infoItemIds: number[]): Promise<void>;
    delete(id: number): Promise<void>;
    deleteIntoItem(infoGroupId: number, infoItemIds: number[]): Promise<void>;
    update(id: number, name: string, roleId: number): Promise<void>;
    findAll(): Promise<InfoGroup[]>;
    findItemsById(id: number): Promise<any[]>;
}
