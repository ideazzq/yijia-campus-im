package com.nicolas.chatapp.config;

import io.jsonwebtoken.Claims;
import com.nicolas.chatapp.repository.UserRepository;
import com.nicolas.chatapp.service.implementation.PresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private final TokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PresenceService presenceService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String jwt = accessor.getFirstNativeHeader(JwtConstants.TOKEN_HEADER);
            if (jwt == null || jwt.isBlank()) {
                return message;
            }

            Claims claims = tokenProvider.getClaimsFromToken(jwt);
            String email = String.valueOf(claims.get(JwtConstants.EMAIL));
            String authorities = String.valueOf(claims.get(JwtConstants.AUTHORITIES));
            List<GrantedAuthority> auths = AuthorityUtils.commaSeparatedStringToAuthorityList(authorities);
            Authentication authentication = new UsernamePasswordAuthenticationToken(email, null, auths);
            accessor.setUser(authentication);
            userRepository.findByEmail(email).ifPresent(user ->
                    presenceService.bindSession(user.getId(), accessor.getSessionId()));
        }

        return message;
    }
}
