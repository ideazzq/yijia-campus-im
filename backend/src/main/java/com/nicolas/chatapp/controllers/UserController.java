package com.nicolas.chatapp.controllers;

import com.nicolas.chatapp.config.JwtConstants;
import com.nicolas.chatapp.dto.request.AddFriendRequestDTO;
import com.nicolas.chatapp.dto.request.UpdateRemarkRequestDTO;
import com.nicolas.chatapp.dto.request.UpdateUserRequestDTO;
import com.nicolas.chatapp.dto.response.ApiResponseDTO;
import com.nicolas.chatapp.dto.response.ContactDTO;
import com.nicolas.chatapp.dto.response.FriendRequestDTO;
import com.nicolas.chatapp.dto.response.UserDTO;
import com.nicolas.chatapp.dto.response.UserPresenceDTO;
import com.nicolas.chatapp.exception.UserException;
import com.nicolas.chatapp.model.User;
import com.nicolas.chatapp.service.UserService;
import com.nicolas.chatapp.service.implementation.PresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final PresenceService presenceService;

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getUserProfile(@RequestHeader(JwtConstants.TOKEN_HEADER) String token) throws UserException {
        User user = userService.findUserByProfile(token);
        return new ResponseEntity<>(UserDTO.fromUser(user), HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<UserPresenceDTO>> getAllUsers(@RequestHeader(JwtConstants.TOKEN_HEADER) String token)
            throws UserException {

        User currentUser = userService.findUserByProfile(token);
        presenceService.markOnline(currentUser.getId());

        List<UserPresenceDTO> users = userService.findAllUsers().stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .map(UserDTO::fromUser)
                .map(user -> UserPresenceDTO.fromUser(user, presenceService.isOnline(user.id())))
                .toList();

        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/{query}")
    public ResponseEntity<List<UserDTO>> searchUsers(@PathVariable String query,
                                                     @RequestHeader(JwtConstants.TOKEN_HEADER) String token)
            throws UserException {

        User currentUser = userService.findUserByProfile(token);
        List<User> users = userService.searchUser(query).stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .toList();

        return new ResponseEntity<>(UserDTO.fromUsersAsList(users), HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDTO>> searchUsersByName(@RequestParam("name") String name,
                                                           @RequestHeader(JwtConstants.TOKEN_HEADER) String token)
            throws UserException {

        User currentUser = userService.findUserByProfile(token);
        List<User> users = userService.searchUserByName(name).stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .toList();

        return new ResponseEntity<>(UserDTO.fromUsersAsList(users), HttpStatus.OK);
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponseDTO> updateUser(@RequestBody UpdateUserRequestDTO request,
                                                     @RequestHeader(JwtConstants.TOKEN_HEADER) String token)
            throws UserException {

        User user = userService.findUserByProfile(token);
        user = userService.updateUser(user.getId(), request);
        log.info("User updated: {}", user.getEmail());

        ApiResponseDTO response = ApiResponseDTO.builder()
                .message("个人资料已更新")
                .status(true)
                .build();

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contacts")
    public ResponseEntity<List<ContactDTO>> getContacts(@RequestHeader(JwtConstants.TOKEN_HEADER) String token)
            throws UserException {

        User currentUser = userService.findUserByProfile(token);
        return new ResponseEntity<>(ContactDTO.fromContacts(userService.findContacts(currentUser.getId())), HttpStatus.OK);
    }

    @PostMapping("/contacts")
    public ResponseEntity<FriendRequestDTO> addFriend(@RequestBody AddFriendRequestDTO request,
                                                      @RequestHeader(JwtConstants.TOKEN_HEADER) String token)
            throws UserException {

        User currentUser = userService.findUserByProfile(token);
        return new ResponseEntity<>(FriendRequestDTO.fromRequest(userService.sendFriendRequest(currentUser, request)), HttpStatus.OK);
    }

    @GetMapping("/friend-requests/incoming")
    public ResponseEntity<List<FriendRequestDTO>> getIncomingRequests(@RequestHeader(JwtConstants.TOKEN_HEADER) String token)
            throws UserException {

        User currentUser = userService.findUserByProfile(token);
        return new ResponseEntity<>(FriendRequestDTO.fromRequests(userService.getIncomingFriendRequests(currentUser.getId())), HttpStatus.OK);
    }

    @GetMapping("/friend-requests/outgoing")
    public ResponseEntity<List<FriendRequestDTO>> getOutgoingRequests(@RequestHeader(JwtConstants.TOKEN_HEADER) String token)
            throws UserException {

        User currentUser = userService.findUserByProfile(token);
        return new ResponseEntity<>(FriendRequestDTO.fromRequests(userService.getOutgoingFriendRequests(currentUser.getId())), HttpStatus.OK);
    }

    @PostMapping("/friend-requests/{requestId}/approve")
    public ResponseEntity<FriendRequestDTO> approveFriendRequest(@PathVariable UUID requestId,
                                                                 @RequestHeader(JwtConstants.TOKEN_HEADER) String token)
            throws UserException {

        User currentUser = userService.findUserByProfile(token);
        return new ResponseEntity<>(FriendRequestDTO.fromRequest(userService.approveFriendRequest(currentUser, requestId)), HttpStatus.OK);
    }

    @PostMapping("/friend-requests/{requestId}/reject")
    public ResponseEntity<FriendRequestDTO> rejectFriendRequest(@PathVariable UUID requestId,
                                                                @RequestHeader(JwtConstants.TOKEN_HEADER) String token)
            throws UserException {

        User currentUser = userService.findUserByProfile(token);
        return new ResponseEntity<>(FriendRequestDTO.fromRequest(userService.rejectFriendRequest(currentUser, requestId)), HttpStatus.OK);
    }

    @PutMapping("/contacts/{friendId}/remark")
    public ResponseEntity<ContactDTO> updateRemark(@PathVariable UUID friendId,
                                                   @RequestBody UpdateRemarkRequestDTO request,
                                                   @RequestHeader(JwtConstants.TOKEN_HEADER) String token)
            throws UserException {

        User currentUser = userService.findUserByProfile(token);
        return new ResponseEntity<>(ContactDTO.fromContact(userService.updateRemark(currentUser, friendId, request)), HttpStatus.OK);
    }
}
