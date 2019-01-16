export interface UserInfoData {
    id: number;
    username: string;
    email: string;
    mobile: string;
    banned: boolean;
    recycle: boolean;
    createdAt: string;
    updatedAt: string;
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
        infoItemId: number;
        type: string;
        name: string;
        value: string;
        description: string;
        registerDisplay: boolean;
        informationDisplay: boolean;
    }[];
}

export interface CreateUserInput {
    username?: string;
    email?: string;
    mobile?: string;
    password?: string;
    banned?: boolean;
    infoKVs?: CreateUserInfoKVs[];
    roleIds?: number[];
    organizationIds?: number[];
}

export interface UpdateUserInput {
    username?: string;
    email?: string;
    mobile?: string;
    password?: string;
    banned?: boolean;
    recycle?: boolean;
    infoKVs?: UpdateUserInfoKVs[];
    roleIds?: {
        before: number;
        after: number;
    }[];
    organizationIds?: {
        before: number;
        after: number;
    }[];
}

export interface CreateUserInfoKVs {
    infoItemId: number;
    userInfoValue: string;
}

export interface UpdateUserInfoKVs {
    userInfoId: number;
    userInfoValue: string;
    infoItemId?: number;
}