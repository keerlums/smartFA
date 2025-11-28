package com.smartfa.common.service;

import com.smartfa.common.entity.User;
import com.smartfa.common.enums.ResultCode;
import com.smartfa.common.mapper.UserMapper;
import com.smartfa.common.service.impl.UserServiceImpl;
import com.smartfa.common.util.JwtUtil;
import com.smartfa.common.util.PasswordUtil;
import com.smartfa.common.vo.Result;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * 用户服务测试类
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserServiceImpl userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setPassword(PasswordUtil.encode("password123"));
        testUser.setRealName("测试用户");
        testUser.setEmail("test@example.com");
        testUser.setStatus(1);
        testUser.setCreateTime(LocalDateTime.now());
        testUser.setUpdateTime(LocalDateTime.now());
    }

    @Test
    void testFindByUsername_Success() {
        // Given
        when(userMapper.findByUsername("testuser")).thenReturn(testUser);

        // When
        User result = userService.findByUsername("testuser");

        // Then
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        verify(userMapper, times(1)).findByUsername("testuser");
    }

    @Test
    void testFindByUsername_NotFound() {
        // Given
        when(userMapper.findByUsername("nonexistent")).thenReturn(null);

        // When
        User result = userService.findByUsername("nonexistent");

        // Then
        assertNull(result);
        verify(userMapper, times(1)).findByUsername("nonexistent");
    }

    @Test
    void testLogin_Success() {
        // Given
        when(userMapper.findByUsername("testuser")).thenReturn(testUser);
        when(userMapper.updateById(any(User.class))).thenReturn(1);

        // When
        Result<String> result = userService.login("testuser", "password123");

        // Then
        assertTrue(result.isSuccess());
        assertNotNull(result.getData());
        verify(userMapper, times(1)).findByUsername("testuser");
        verify(userMapper, times(1)).updateById(any(User.class));
    }

    @Test
    void testLogin_UserNotFound() {
        // Given
        when(userMapper.findByUsername("nonexistent")).thenReturn(null);

        // When
        Result<String> result = userService.login("nonexistent", "password123");

        // Then
        assertFalse(result.isSuccess());
        assertEquals(ResultCode.USER_NOT_FOUND.getCode(), result.getCode());
        verify(userMapper, times(1)).findByUsername("nonexistent");
    }

    @Test
    void testLogin_WrongPassword() {
        // Given
        when(userMapper.findByUsername("testuser")).thenReturn(testUser);

        // When
        Result<String> result = userService.login("testuser", "wrongpassword");

        // Then
        assertFalse(result.isSuccess());
        assertEquals(ResultCode.PASSWORD_ERROR.getCode(), result.getCode());
        verify(userMapper, times(1)).findByUsername("testuser");
    }

    @Test
    void testLogin_UserDisabled() {
        // Given
        testUser.setStatus(0);
        when(userMapper.findByUsername("testuser")).thenReturn(testUser);

        // When
        Result<String> result = userService.login("testuser", "password123");

        // Then
        assertFalse(result.isSuccess());
        assertEquals(ResultCode.USER_DISABLED.getCode(), result.getCode());
        verify(userMapper, times(1)).findByUsername("testuser");
    }

    @Test
    void testCreateUser_Success() {
        // Given
        User newUser = new User();
        newUser.setUsername("newuser");
        newUser.setPassword("password123");
        newUser.setRealName("新用户");
        newUser.setEmail("newuser@example.com");

        when(userMapper.findByUsername("newuser")).thenReturn(null);
        when(userMapper.findByEmail("newuser@example.com")).thenReturn(null);
        when(userMapper.insert(any(User.class))).thenReturn(1);

        // When
        Result<User> result = userService.createUser(newUser);

        // Then
        assertTrue(result.isSuccess());
        assertNotNull(result.getData());
        assertEquals("newuser", result.getData().getUsername());
        verify(userMapper, times(1)).findByUsername("newuser");
        verify(userMapper, times(1)).findByEmail("newuser@example.com");
        verify(userMapper, times(1)).insert(any(User.class));
    }

    @Test
    void testCreateUser_UsernameExists() {
        // Given
        User newUser = new User();
        newUser.setUsername("testuser");
        newUser.setPassword("password123");

        when(userMapper.findByUsername("testuser")).thenReturn(testUser);

        // When
        Result<User> result = userService.createUser(newUser);

        // Then
        assertFalse(result.isSuccess());
        assertEquals(ResultCode.USERNAME_ALREADY_EXISTS.getCode(), result.getCode());
        verify(userMapper, times(1)).findByUsername("testuser");
        verify(userMapper, never()).insert(any(User.class));
    }

    @Test
    void testCreateUser_EmailExists() {
        // Given
        User newUser = new User();
        newUser.setUsername("newuser");
        newUser.setPassword("password123");
        newUser.setEmail("test@example.com");

        when(userMapper.findByUsername("newuser")).thenReturn(null);
        when(userMapper.findByEmail("test@example.com")).thenReturn(testUser);

        // When
        Result<User> result = userService.createUser(newUser);

        // Then
        assertFalse(result.isSuccess());
        assertEquals(ResultCode.EMAIL_ALREADY_EXISTS.getCode(), result.getCode());
        verify(userMapper, times(1)).findByUsername("newuser");
        verify(userMapper, times(1)).findByEmail("test@example.com");
        verify(userMapper, never()).insert(any(User.class));
    }

    @Test
    void testUpdateUser_Success() {
        // Given
        User updateUser = new User();
        updateUser.setId(1L);
        updateUser.setUsername("testuser");
        updateUser.setRealName("更新用户");
        updateUser.setEmail("updated@example.com");

        when(userMapper.selectById(1L)).thenReturn(testUser);
        when(userMapper.updateById(any(User.class))).thenReturn(1);

        // When
        Result<User> result = userService.updateUser(updateUser);

        // Then
        assertTrue(result.isSuccess());
        assertNotNull(result.getData());
        verify(userMapper, times(1)).selectById(1L);
        verify(userMapper, times(1)).updateById(any(User.class));
    }

    @Test
    void testUpdateUser_UserNotFound() {
        // Given
        User updateUser = new User();
        updateUser.setId(999L);
        updateUser.setUsername("nonexistent");

        when(userMapper.selectById(999L)).thenReturn(null);

        // When
        Result<User> result = userService.updateUser(updateUser);

        // Then
        assertFalse(result.isSuccess());
        verify(userMapper, times(1)).selectById(999L);
        verify(userMapper, never()).updateById(any(User.class));
    }

    @Test
    void testDeleteUser_Success() {
        // Given
        when(userMapper.selectById(1L)).thenReturn(testUser);
        when(userMapper.updateById(any(User.class))).thenReturn(1);

        // When
        Result<Void> result = userService.deleteUser(1L);

        // Then
        assertTrue(result.isSuccess());
        verify(userMapper, times(1)).selectById(1L);
        verify(userMapper, times(1)).updateById(any(User.class));
    }

    @Test
    void testDeleteUser_UserNotFound() {
        // Given
        when(userMapper.selectById(999L)).thenReturn(null);

        // When
        Result<Void> result = userService.deleteUser(999L);

        // Then
        assertFalse(result.isSuccess());
        verify(userMapper, times(1)).selectById(999L);
        verify(userMapper, never()).updateById(any(User.class));
    }

    @Test
    void testChangePassword_Success() {
        // Given
        when(userMapper.selectById(1L)).thenReturn(testUser);
        when(userMapper.updateById(any(User.class))).thenReturn(1);

        // When
        Result<Void> result = userService.changePassword(1L, "password123", "newpassword123");

        // Then
        assertTrue(result.isSuccess());
        verify(userMapper, times(1)).selectById(1L);
        verify(userMapper, times(1)).updateById(any(User.class));
    }

    @Test
    void testChangePassword_WrongOldPassword() {
        // Given
        when(userMapper.selectById(1L)).thenReturn(testUser);

        // When
        Result<Void> result = userService.changePassword(1L, "wrongpassword", "newpassword123");

        // Then
        assertFalse(result.isSuccess());
        assertEquals(ResultCode.PASSWORD_ERROR.getCode(), result.getCode());
        verify(userMapper, times(1)).selectById(1L);
        verify(userMapper, never()).updateById(any(User.class));
    }

    @Test
    void testResetPassword_Success() {
        // Given
        when(userMapper.selectById(1L)).thenReturn(testUser);
        when(userMapper.updateById(any(User.class))).thenReturn(1);

        // When
        Result<Void> result = userService.resetPassword(1L, "newpassword123");

        // Then
        assertTrue(result.isSuccess());
        verify(userMapper, times(1)).selectById(1L);
        verify(userMapper, times(1)).updateById(any(User.class));
    }
}