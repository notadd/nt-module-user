export interface OrganizationUserData {
    userId: number;
    userRoles: {
        id: number;
        name: string
    }[];
    userInfos: {
        id: number;
        name: string;
        value: string;
        label: string;
        description: string;
        type: string;
    }[];
}