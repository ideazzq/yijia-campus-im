package com.nicolas.chatapp.service.implementation;

import com.nicolas.chatapp.config.AdminCredentials;
import com.nicolas.chatapp.config.Roles;
import com.nicolas.chatapp.model.User;
import com.nicolas.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final AdminCredentials adminCredentials;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (adminCredentials.email().equalsIgnoreCase(username)) {
            List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(Roles.ADMIN));
            return new org.springframework.security.core.userdetails.User(
                    adminCredentials.email(),
                    adminCredentials.encodedPassword(),
                    authorities
            );
        }

        Optional<User> optionalUser = userRepository.findByLoginIdentifier(username);
        if (optionalUser.isEmpty()) {
            throw new UsernameNotFoundException("账号不存在");
        }

        User user = optionalUser.get();
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(Roles.USER));

        return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), authorities);
    }
}
