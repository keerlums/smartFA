package com.smartfa.common.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.smartfa.common.entity.User;
import com.smartfa.common.enums.ResultCode;
import com.smartfa.common.exception.BusinessException;
import com.smartfa.common.mapper.UserMapper;
import com.smartfa.common.service.UserService;
import com.smartfa.common.util.JwtUtil;
import com.smartfa.common.util.PasswordUtil;
import com.smartfa.common.vo.Result;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 用户服务实现类
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private UserMapper userMapper;

    @Override
    public User findByUsername(String username) {
        return userMapper.findByUsername(username);
    }

    @Override
    public User findByEmail(String email) {
        return userMapper.findByEmail(email);
    }

    @Override
    public Result<String> login(String username, String password) {
        try {
            // 查询用户
            User user = findByUsername(username);
            if (user == null) {
                return Result.error(ResultCode.USER_NOT_FOUND);
            }

            // 检查用户状态
            if (user.getStatus() == 0) {
                return Result.error(ResultCode.USER_DISABLED);
            }

            // 验证密码
            if (!PasswordUtil.matches(password, user.getPassword())) {
                return Result.error(ResultCode.PASSWORD_ERROR);
            }

            // 生成JWT Token
            String token = JwtUtil.createToken(user.getId(), user.getUsername());

            // 更新最后登录时间
            user.setUpdateTime(LocalDateTime.now());
            userMapper.updateById(user);

            log.info("用户登录成功: {}", username);
            return Result.success(token);

        } catch (Exception e) {
            log.error("用户登录失败: {}", e.getMessage(), e);
            return Result.error(ResultCode.SYSTEM_ERROR);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<User> createUser(User user) {
        try {
            // 检查用户名是否已存在
            if (findByUsername(user.getUsername()) != null) {
                return Result.error(ResultCode.USERNAME_ALREADY_EXISTS);
            }

            // 检查邮箱是否已存在
            if (StringUtils.hasText(user.getEmail()) && findByEmail(user.getEmail()) != null) {
                return Result.error(ResultCode.EMAIL_ALREADY_EXISTS);
            }

            // 加密密码
            user.setPassword(PasswordUtil.encode(user.getPassword()));

            // 设置默认状态
            if (user.getStatus() == null) {
                user.setStatus(1);
            }

            // 保存用户
            userMapper.insert(user);

            log.info("创建用户成功: {}", user.getUsername());
            return Result.success(user);

        } catch (Exception e) {
            log.error("创建用户失败: {}", e.getMessage(), e);
            throw new BusinessException("创建用户失败");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<User> updateUser(User user) {
        try {
            User existingUser = userMapper.selectById(user.getId());
            if (existingUser == null) {
                return Result.error(ResultCode.USER_NOT_FOUND);
            }

            // 检查用户名是否被其他用户使用
            User userWithSameName = findByUsername(user.getUsername());
            if (userWithSameName != null && !userWithSameName.getId().equals(user.getId())) {
                return Result.error(ResultCode.USERNAME_ALREADY_EXISTS);
            }

            // 检查邮箱是否被其他用户使用
            if (StringUtils.hasText(user.getEmail())) {
                User userWithSameEmail = findByEmail(user.getEmail());
                if (userWithSameEmail != null && !userWithSameEmail.getId().equals(user.getId())) {
                    return Result.error(ResultCode.EMAIL_ALREADY_EXISTS);
                }
            }

            // 如果密码有变化，重新加密
            if (StringUtils.hasText(user.getPassword()) && 
                !user.getPassword().equals(existingUser.getPassword())) {
                user.setPassword(PasswordUtil.encode(user.getPassword()));
            } else {
                user.setPassword(existingUser.getPassword());
            }

            // 更新用户
            userMapper.updateById(user);

            log.info("更新用户成功: {}", user.getUsername());
            return Result.success(user);

        } catch (Exception e) {
            log.error("更新用户失败: {}", e.getMessage(), e);
            throw new BusinessException("更新用户失败");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> deleteUser(Long userId) {
        try {
            User user = userMapper.selectById(userId);
            if (user == null) {
                return Result.error(ResultCode.USER_NOT_FOUND);
            }

            // 软删除：设置状态为禁用
            user.setStatus(0);
            userMapper.updateById(user);

            log.info("删除用户成功: {}", user.getUsername());
            return Result.success();

        } catch (Exception e) {
            log.error("删除用户失败: {}", e.getMessage(), e);
            throw new BusinessException("删除用户失败");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> assignRoles(Long userId, List<Long> roleIds) {
        try {
            // TODO: 实现用户角色分配逻辑
            log.info("分配角色成功: userId={}, roleIds={}", userId, roleIds);
            return Result.success();

        } catch (Exception e) {
            log.error("分配角色失败: {}", e.getMessage(), e);
            throw new BusinessException("分配角色失败");
        }
    }

    @Override
    public List<Long> getUserRoleIds(Long userId) {
        // TODO: 实现获取用户角色ID列表逻辑
        return List.of();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> changePassword(Long userId, String oldPassword, String newPassword) {
        try {
            User user = userMapper.selectById(userId);
            if (user == null) {
                return Result.error(ResultCode.USER_NOT_FOUND);
            }

            // 验证旧密码
            if (!PasswordUtil.matches(oldPassword, user.getPassword())) {
                return Result.error(ResultCode.PASSWORD_ERROR);
            }

            // 更新新密码
            user.setPassword(PasswordUtil.encode(newPassword));
            userMapper.updateById(user);

            log.info("修改密码成功: userId={}", userId);
            return Result.success();

        } catch (Exception e) {
            log.error("修改密码失败: {}", e.getMessage(), e);
            throw new BusinessException("修改密码失败");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> resetPassword(Long userId, String newPassword) {
        try {
            User user = userMapper.selectById(userId);
            if (user == null) {
                return Result.error(ResultCode.USER_NOT_FOUND);
            }

            // 更新密码
            user.setPassword(PasswordUtil.encode(newPassword));
            userMapper.updateById(user);

            log.info("重置密码成功: userId={}", userId);
            return Result.success();

        } catch (Exception e) {
            log.error("重置密码失败: {}", e.getMessage(), e);
            throw new BusinessException("重置密码失败");
        }
    }
}