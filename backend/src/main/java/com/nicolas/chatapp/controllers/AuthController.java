package com.nicolas.chatapp.controllers;

import com.nicolas.chatapp.config.JwtConstants;
import com.nicolas.chatapp.config.Roles;
import com.nicolas.chatapp.config.TokenProvider;
import com.nicolas.chatapp.dto.request.LoginRequestDTO;
import com.nicolas.chatapp.dto.request.UpdateUserRequestDTO;
import com.nicolas.chatapp.dto.response.LoginResponseDTO;
import com.nicolas.chatapp.exception.UserException;
import com.nicolas.chatapp.model.User;
import com.nicolas.chatapp.repository.UserRepository;
import com.nicolas.chatapp.service.UserService;
import com.nicolas.chatapp.service.implementation.CustomUserDetailsService;
import com.nicolas.chatapp.service.implementation.PresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@CrossOrigin
@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final TokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CustomUserDetailsService customUserDetailsService;
    private final PresenceService presenceService;
    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<LoginResponseDTO> signup(@RequestBody UpdateUserRequestDTO signupRequestDTO) throws UserException {
        User newUser = userService.registerUser(signupRequestDTO);
        presenceService.markOnline(newUser.getId());

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                newUser.getEmail(),
                signupRequestDTO.password(),
                java.util.List.of(new SimpleGrantedAuthority(Roles.USER))
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        log.info("User {} successfully signed up", newUser.getEmail());

        return new ResponseEntity<>(LoginResponseDTO.builder()
                .token(jwt)
                .isAuthenticated(true)
                .build(), HttpStatus.ACCEPTED);
    }

    @PostMapping("/signin")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO loginRequestDTO) {
        final String loginIdentifier = loginRequestDTO.account();
        final String password = loginRequestDTO.password();

        Authentication authentication = authenticateReq(loginIdentifier, password);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        userRepository.findByLoginIdentifier(loginIdentifier).ifPresent(user -> presenceService.markOnline(user.getId()));

        log.info("User {} successfully signed in", loginIdentifier);

        return new ResponseEntity<>(LoginResponseDTO.builder()
                .token(jwt)
                .isAuthenticated(true)
                .build(), HttpStatus.ACCEPTED);
    }

    @PostMapping("/admin/signin")
    public ResponseEntity<LoginResponseDTO> adminLogin(@RequestBody LoginRequestDTO loginRequestDTO) {
        final String email = loginRequestDTO.account();
        final String password = loginRequestDTO.password();

        Authentication authentication = authenticateReq(email, password);
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> Roles.ADMIN.equals(authority.getAuthority()));

        if (!isAdmin) {
            throw new BadCredentialsException("管理员账号或密码错误");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        log.info("Admin {} successfully signed in", email);

        return new ResponseEntity<>(LoginResponseDTO.builder()
                .token(jwt)
                .isAuthenticated(true)
                .build(), HttpStatus.ACCEPTED);
    }

    @PostMapping("/signout")
    public ResponseEntity<Void> signout(@RequestHeader(JwtConstants.TOKEN_HEADER) String jwt) {
        String email = String.valueOf(tokenProvider.getClaimsFromToken(jwt).get(JwtConstants.EMAIL));
        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> presenceService.markOffline(user.getId()));
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok().build();
    }

    public Authentication authenticateReq(String username, String password) {
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

        if (userDetails == null) {
            throw new BadCredentialsException("账号不存在");
        }

        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("密码不正确");
        }

        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }
}
