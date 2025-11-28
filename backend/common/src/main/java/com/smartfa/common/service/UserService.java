package com.smartfa.common.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.smartfa.common.entity.User;
import com.smartfa.common.vo.Result;

import java.util.List;

/**
 * 用户服务接口
 */
public interface UserService extends IService<User> {

    /**
     * 根据用户名查询用户
     *
     * @param username 用户名
     * @return 用户信息
     */
    User findByUsername(String username);

    /**
     * 根据邮箱查询用户
     *
     * @param email 邮箱
     * @return 用户信息
     */
    User findByEmail(String email);

    /**
     * 用户登录
     *
     * @param username 用户名
     * @param password 密码
     * @return 登录结果
     */
    Result<String> login(String username, String password);

    /**
     * 创建用户
     *
     * @param user 用户信息
     * @return 创建结果
     */
    Result<User> createUser(User user);

    /**
     * 更新用户
     *
     * @param user 用户信息
     * @return 更新结果
     */
    Result<User> updateUser(User user);

    /**
     * 删除用户
     *
     * @param userId 用户ID
     * @return 删除结果
     */
    Result<Void> deleteUser(Long userId);

    /**
     * 分配角色给用户
     *
     * @param userId 用户ID
     * @param roleIds 角色ID列表
     * @return 分配结果
     */
    Result<Void> assignRoles(Long userId, List<Long> roleIds);

    /**
     * 获取用户的角色列表
     *
     * @param userId 用户ID
     * @return 角色列表
     */
    List<Long> getUserRoleIds(Long userId);

    /**
     * 修改密码
     *
     * @param userId 用户ID
     * @param oldPassword 旧密码
     * @param newPassword 新密码
     * @return 修改结果
     */
    Result<Void> changePassword(Long userId, String oldPassword, String newPassword);

    /**
     * 重置密码
     *
     * @param userId 用户ID
     * @param newPassword 新密码
     * @return 重置结果
     */
    Result<Void> resetPassword(Long userId, String newPassword);
}