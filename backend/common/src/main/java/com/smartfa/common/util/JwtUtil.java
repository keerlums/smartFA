package com.smartfa.common.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

/**
 * JWT工具类
 */
@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret:smartfa-secret-key}")
    private String secret;

    @Value("${jwt.expiration:86400}")
    private Long expiration;

    /**
     * Token过期时间（秒）
     */
    public static final Long EXPIRATION = 86400L;

    /**
     * 创建JWT Token
     *
     * @param userId 用户ID
     * @param username 用户名
     * @return JWT Token
     */
    public static String createToken(Long userId, String username) {
        // 这里使用默认配置，实际应该从配置文件读取
        String secret = "smartfa-secret-key";
        Long expiration = 86400L; // 24小时

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration * 1000);

        return JWT.create()
                .withSubject(userId.toString())
                .withClaim("username", username)
                .withIssuedAt(now)
                .withExpiresAt(expiryDate)
                .sign(Algorithm.HMAC256(secret));
    }

    /**
     * 创建JWT Token（简化版本）
     *
     * @param username 用户名
     * @return JWT Token
     */
    public static String generateToken(String username) {
        return createToken(1L, username); // 使用默认用户ID
    }

    /**
     * 验证JWT Token
     *
     * @param token JWT Token
     * @return 验证结果
     */
    public static boolean verifyToken(String token) {
        try {
            String secret = "smartfa-secret-key";
            Algorithm algorithm = Algorithm.HMAC256(secret);
            JWTVerifier verifier = JWT.require(algorithm).build();
            verifier.verify(token);
            return true;
        } catch (JWTVerificationException e) {
            log.error("JWT Token验证失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 从Token中获取用户ID
     *
     * @param token JWT Token
     * @return 用户ID
     */
    public static Long getUserIdFromToken(String token) {
        try {
            DecodedJWT jwt = JWT.decode(token);
            return Long.valueOf(jwt.getSubject());
        } catch (Exception e) {
            log.error("从Token中获取用户ID失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 从Token中获取用户名
     *
     * @param token JWT Token
     * @return 用户名
     */
    public static String getUsernameFromToken(String token) {
        try {
            DecodedJWT jwt = JWT.decode(token);
            return jwt.getClaim("username").asString();
        } catch (Exception e) {
            log.error("从Token中获取用户名失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 判断Token是否过期
     *
     * @param token JWT Token
     * @return 是否过期
     */
    public static boolean isTokenExpired(String token) {
        try {
            DecodedJWT jwt = JWT.decode(token);
            return jwt.getExpiresAt().before(new Date());
        } catch (Exception e) {
            log.error("判断Token是否过期失败: {}", e.getMessage());
            return true;
        }
    }

    /**
     * 刷新Token
     *
     * @param token 原Token
     * @return 新Token
     */
    public static String refreshToken(String token) {
        try {
            DecodedJWT jwt = JWT.decode(token);
            Long userId = Long.valueOf(jwt.getSubject());
            String username = jwt.getClaim("username").asString();
            return createToken(userId, username);
        } catch (Exception e) {
            log.error("刷新Token失败: {}", e.getMessage());
            return null;
        }
    }
}