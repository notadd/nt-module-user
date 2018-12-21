import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { __ as t } from 'i18n';

import { InfoItem } from '../entities/info-item.entity';
import { UpdateInfoItemInput } from '../interfaces/info-item.interface';
import { InfoItemService } from '../services/info-item.service';

@Controller()
export class InfoItemGrpcController {
    constructor(
        @Inject(InfoItemService) private readonly infoItemService: InfoItemService
    ) { }

    @GrpcMethod('InfoItemService')
    async createInfoItem(payload: { infoItemInput: InfoItem }) {
        await this.infoItemService.create(payload.infoItemInput);
        return { code: 200, message: t('Create information item successfully') };
    }

    @GrpcMethod('InfoItemService')
    async deleteInfoItem(payload: { infoItemId: number }) {
        await this.infoItemService.delete(payload.infoItemId);
        return { code: 200, message: t('Delete information item successfully') };
    }

    @GrpcMethod('InfoItemService')
    async updateInfoItem(payload: { updateInfoItemInput: UpdateInfoItemInput }) {
        await this.infoItemService.update(payload.updateInfoItemInput);
        return { code: 200, message: t('Update information item successfully') };
    }

    @GrpcMethod('InfoItemService')
    async findAllInfoItem(payload: { pageNumber: number, pageSize: number }) {
        const result = await this.infoItemService.findAll(payload.pageNumber, payload.pageSize);
        let data: InfoItem[];
        let count: number;
        if (typeof result[1] === 'number') {
            data = (result as [InfoItem[], number])[0];
            count = (result as [InfoItem[], number])[1];
        } else {
            data = result as InfoItem[];
        }
        return { code: 200, message: t('Query all information items successfully'), data, count };
    }
}