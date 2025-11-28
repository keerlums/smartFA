package com.smartfa.common.controller;

import com.smartfa.common.service.UserService;
import com.smartfa.common.util.JwtUtil;
import com.smartfa.common.vo.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 认证控制器
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "认证管理", description = "用户认证相关接口")
public class AuthController {
    
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    @Operation(summary = "用户登录", description = "用户登录获取访问令牌")
    public Result<Map<String, Object>> login(@RequestBody LoginRequest loginRequest) {
        try {
            Result<String> loginResult = userService.login(
                loginRequest.getUsername(), 
                loginRequest.getPassword()
            );
            
            if (loginResult.getCode() != 200) {
                return Result.error(loginResult.getCode(), loginResult.getMessage());
            }
            
            String token = loginResult.getData();
            var user = userService.findByUsername(loginRequest.getUsername());
            
            Map<String, Object> data = new HashMap<>();
            data.put("token", token);
            data.put("user", user);
            data.put("expiresIn", JwtUtil.EXPIRATION);
            
            return Result.success(data);
            
        } catch (Exception e) {
            log.error("登录失败", e);
            return Result.error(500, "登录失败");
        }
    }

    @PostMapping("/logout")
    @Operation(summary = "用户登出", description = "用户登出")
    public Result<Void> logout(@RequestHeader("Authorization") String authorization) {
        try {
            // TODO: 实现token黑名单机制
            return Result.success();
        } catch (Exception e) {
            log.error("登出失败", e);
            return Result.error(500, "登出失败");
        }
    }

    @GetMapping("/me")
    @Operation(summary = "获取当前用户信息", description = "根据token获取当前登录用户信息")
    public Result<Object> getCurrentUser(@RequestHeader("Authorization") String authorization) {
        try {
            String token = authorization.replace("Bearer ", "");
            String username = JwtUtil.getUsernameFromToken(token);
            
            var user = userService.findByUsername(username);
            if (user == null) {
                return Result.error(404, "用户不存在");
            }
            
            return Result.success(user);
            
        } catch (Exception e) {
            log.error("获取当前用户信息失败", e);
            return Result.error(500, "获取用户信息失败");
        }
    }

    @PostMapping("/refresh")
    @Operation(summary = "刷新令牌", description = "刷新访问令牌")
    public Result<Map<String, Object>> refreshToken(@RequestHeader("Authorization") String authorization) {
        try {
            String token = authorization.replace("Bearer ", "");
            String username = JwtUtil.getUsernameFromToken(token);
            
            var user = userService.findByUsername(username);
            if (user == null) {
                return Result.error(404, "用户不存在");
            }
            
            String newToken = JwtUtil.generateToken(username);
            
            Map<String, Object> data = new HashMap<>();
            data.put("token", newToken);
            data.put("expiresIn", JwtUtil.EXPIRATION);
            
            return Result.success(data);
            
        } catch (Exception e) {
            log.error("刷新令牌失败", e);
            return Result.error(500, "刷新令牌失败");
        }
    }

    /**
     * 登录请求体
     */
    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}