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
    /**
     * 用户名
     */
    username: string;
    /**
     * 用户邮箱
     */
    email?: string;
    /**
     * 用户手机号
     */
    mobile?: string;
    /**
     * 登录密码
     */
    password: string;
    /**
     * 信息项键值对，key是信息项的ID(infoItem.id)，值是信息项的值(userInfo.value)
     */
    infoKVs?: { key: number; value: string }[];
    /**
     * 拥有的角色ID数组
     */
    roleIds?: number[];
    /**
     * 所属的组织ID数组
     */
    organizationIds?: number[];
}

export interface UpdateUserInput {
    /**
     * 用户邮箱
     */
    email?: string;
    /**
     * 用户手机号
     */
    mobile?: string;
    /**
     * 登录密码
     */
    password?: string;
    /**
     * 信息项值键值对，key是用户信息项的ID(userInfo.id)，value是信息项的值(userInfo.value)，relationId是当用户完善信息项时传入的
     */
    infoKVs?: {
        key: number;
        value: string;
        relationId?: number
    }[];
    /**
     * 拥有的角色ID对象数组，每项都必须包含更新之前的角色ID(before)，和更新之后的角色ID(after)
     */
    roleIds?: {
        /**
         * 更新之前的角色ID
         */
        before: number;
        /**
         * 更新之后的角色ID
         */
        after: number;
    }[];
    /**
     * 拥有的组织ID对象数组，每项都必须包含更新之前的组织ID(before)，和更新之后的组织ID(after)
     */
    organizationIds?: {
        /**
         * 更新之前的组织ID
         */
        before: number;
        /**
         * 更新之后的组织ID
         */
        after: number;
    }[];
}