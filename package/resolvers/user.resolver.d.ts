import { CommonResult } from '../interfaces/common-result.interface';
import { CreateUserInput, UpdateUserInput, UserInfoData } from '../interfaces/user.interface';
import { UserService } from '../services/user.service';
export declare class UserResolver {
    private readonly userService;
    constructor(userService: UserService);
    login(req: any, body: {
        username: string;
        password: string;
    }): Promise<CommonResult>;
    adminLogin(req: any, body: {
        username: string;
        password: string;
    }): Promise<CommonResult>;
    register(req: any, body: {
        registerUserInput: CreateUserInput;
    }): Promise<CommonResult>;
    createUser(req: any, body: {
        createUserInput: CreateUserInput;
    }): Promise<CommonResult>;
    addUserRole(req: any, body: {
        userId: number;
        roleId: number;
    }): Promise<CommonResult>;
    deleteUserRole(req: any, body: {
        userId: number;
        roleId: number;
    }): Promise<CommonResult>;
    banUser(req: any, body: {
        userId: number;
    }): Promise<CommonResult>;
    recycleUser(req: any, body: {
        userId: number;
    }): Promise<CommonResult>;
    deleteRecycledUser(req: any, body: {
        userId: number;
    }): Promise<CommonResult>;
    revertBannedUser(req: any, body: {
        userId: number;
    }): Promise<CommonResult>;
    revertRecycledUser(req: any, body: {
        userId: number;
    }): Promise<CommonResult>;
    updateUserInfo(req: any, body: {
        userId: number;
        updateUserInput: UpdateUserInput;
    }): Promise<CommonResult>;
    updateCurrentUserInfo(req: any, body: {
        updateCurrentUserInput: UpdateUserInput;
    }, context: any): Promise<CommonResult>;
    findUserInfoById(req: any, body: {
        userIds: number[];
    }): Promise<CommonResult>;
    findCurrentUserInfo(req: any, body: any, context: any): Promise<CommonResult>;
    findRegisterUserInputInfo(): Promise<CommonResult>;
    findUsersInRole(req: any, body: {
        roleId: number;
        pageNumber: number;
        pageSize: number;
    }): Promise<{
        code: number;
        message: string;
        data: UserInfoData[];
        count: number;
    }>;
    findUsersInOrganization(req: any, body: {
        organizationId: number;
        pageNumber: number;
        pageSize: number;
    }): Promise<{
        code: number;
        message: string;
        data: UserInfoData[];
        count: number;
    }>;
    findAllUsers(req: any, body: {
        pageNumber: number;
        pageSize: number;
    }): Promise<{
        code: number;
        message: string;
        data: UserInfoData[];
        count: number;
    }>;
}
