package com.nicolas.chatapp.service;

import com.nicolas.chatapp.dto.request.AddFriendRequestDTO;
import com.nicolas.chatapp.dto.request.UpdateRemarkRequestDTO;
import com.nicolas.chatapp.dto.request.UpdateUserRequestDTO;
import com.nicolas.chatapp.exception.UserException;
import com.nicolas.chatapp.model.ContactEntry;
import com.nicolas.chatapp.model.FriendRequest;
import com.nicolas.chatapp.model.User;

import java.util.List;
import java.util.UUID;

public interface UserService {

    User findUserById(UUID id) throws UserException;

    User findUserByProfile(String jwt) throws UserException;

    User findUserByLoginIdentifier(String loginIdentifier) throws UserException;

    User updateUser(UUID id, UpdateUserRequestDTO request) throws UserException;

    List<User> findAllUsers();

    List<User> searchUser(String query);

    List<User> searchUserByName(String name);

    User registerUser(UpdateUserRequestDTO request) throws UserException;

    List<ContactEntry> findContacts(UUID userId);

    FriendRequest sendFriendRequest(User owner, AddFriendRequestDTO request) throws UserException;

    List<FriendRequest> getIncomingFriendRequests(UUID userId);

    List<FriendRequest> getOutgoingFriendRequests(UUID userId);

    FriendRequest approveFriendRequest(User owner, UUID requestId) throws UserException;

    FriendRequest rejectFriendRequest(User owner, UUID requestId) throws UserException;

    ContactEntry updateRemark(User owner, UUID friendId, UpdateRemarkRequestDTO request) throws UserException;
}
