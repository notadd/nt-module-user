export interface UserInfoData {
    userId: number;
    username: string;
    email: string;
    mobile: string;
    banned: boolean;
    recycle: boolean;
    createTime: string;
    updateTime: string;
    userRoles: {
        id: number;
        name: string
    }[];
    userOrganizations: {
        id: number;
        name: string;
    }[];
    userInfos: {
        id: number;
        order: number;
        relationId: number;
        type: string;
        name: string;
        value: string;
        description: string;
        registerDisplay: boolean;
        informationDisplay: boolean;
    }[];
}

export interface CreateUserInput {
    username: string;
    email?: string;
    mobile?: string;
    password: string;
    infoKVs?: { key: number; value: string }[];
    roleIds?: number[];
    organizationIds?: number[];
}

export interface UpdateUserInput {
    email?: string;
    mobile?: string;
    password?: string;
    infoKVs?: {
        key: number;
        value: string;
        relationId?: number
    }[];
    roleIds?: {
        before: number;
        after: number;
    }[];
    organizationIds?: {
        before: number;
        after: number;
    }[];
}