import { Repository } from 'typeorm';
import { InfoItem } from '../entities/info-item.entity';
import { UpdateInfoItemInput } from '../interfaces/info-item.interface';
import { EntityCheckService } from './entity-check.service';
export declare class InfoItemService {
    private readonly infoItemRepo;
    private readonly entityCheckService;
    constructor(infoItemRepo: Repository<InfoItem>, entityCheckService: EntityCheckService);
    create(infoItem: InfoItem): Promise<void>;
    delete(id: number): Promise<void>;
    update(updateInfoItemInput: UpdateInfoItemInput): Promise<void>;
    findAll(): Promise<InfoItem[]>;
}
