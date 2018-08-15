export interface UserInfoData {
    id: number;
    name: string;
    value: string;
    label: string;
    description: string;
    type: string;
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
    infoKVs: { key: number, value: string }[];
    /**
     * 拥有的角色ID数组
     */
    roleIds: number[];
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
     * 信息项值键值对，key是用户信息项的ID(userInfo.id)，value是信息项的值(userInfo.value)
     */
    infoKVs?: { key: number, value: string }[];
    /**
     * 拥有的角色ID数组
     */
    roleIds?: number[];
    /**
     * 所属的组织ID数组
     */
    organizationIds?: number[];
}