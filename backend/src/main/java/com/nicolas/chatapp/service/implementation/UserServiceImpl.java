package com.nicolas.chatapp.service.implementation;

import com.nicolas.chatapp.config.JwtConstants;
import com.nicolas.chatapp.config.TokenProvider;
import com.nicolas.chatapp.dto.request.AddFriendRequestDTO;
import com.nicolas.chatapp.dto.request.UpdateRemarkRequestDTO;
import com.nicolas.chatapp.dto.request.UpdateUserRequestDTO;
import com.nicolas.chatapp.exception.UserException;
import com.nicolas.chatapp.model.ContactEntry;
import com.nicolas.chatapp.model.FriendRequest;
import com.nicolas.chatapp.model.FriendRequestStatus;
import com.nicolas.chatapp.model.User;
import com.nicolas.chatapp.repository.ContactEntryRepository;
import com.nicolas.chatapp.repository.FriendRequestRepository;
import com.nicolas.chatapp.repository.UserRepository;
import com.nicolas.chatapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ContactEntryRepository contactEntryRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final TokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User findUserById(UUID id) throws UserException {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserException("未找到对应用户"));
    }

    @Override
    public User findUserByProfile(String jwt) throws UserException {
        String email = String.valueOf(tokenProvider.getClaimsFromToken(jwt).get(JwtConstants.EMAIL));
        if (email == null || email.isBlank()) {
            throw new BadCredentialsException("登录凭证已失效");
        }

        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UserException("当前登录用户不存在"));
    }

    @Override
    public User findUserByLoginIdentifier(String loginIdentifier) throws UserException {
        if (loginIdentifier == null || loginIdentifier.isBlank()) {
            throw new UserException("请输入邮箱、手机号或校园号");
        }

        return userRepository.findByLoginIdentifier(loginIdentifier.trim())
                .orElseThrow(() -> new UserException("账号不存在"));
    }

    @Override
    public User updateUser(UUID id, UpdateUserRequestDTO request) throws UserException {
        User user = findUserById(id);

        if (Objects.nonNull(request.fullName()) && !request.fullName().isBlank()) {
            user.setFullName(request.fullName().trim());
        }

        if (Objects.nonNull(request.phoneNumber()) && !request.phoneNumber().isBlank()) {
            String phoneNumber = request.phoneNumber().trim();
            Optional<User> existingPhone = userRepository.findByPhoneNumber(phoneNumber);
            if (existingPhone.isPresent() && !existingPhone.get().getId().equals(user.getId())) {
                throw new UserException("该手机号已被注册");
            }
            user.setPhoneNumber(phoneNumber);
        }

        return userRepository.save(user);
    }

    @Override
    public List<User> findAllUsers() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getFullName))
                .toList();
    }

    @Override
    public List<User> searchUser(String query) {
        return userRepository.findByQuery(query).stream()
                .sorted(Comparator.comparing(User::getFullName))
                .toList();
    }

    @Override
    public List<User> searchUserByName(String name) {
        return userRepository.findByFullName(name).stream()
                .sorted(Comparator.comparing(User::getFullName))
                .toList();
    }

    @Override
    public User registerUser(UpdateUserRequestDTO request) throws UserException {
        validateRegistrationRequest(request);

        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);
        String phoneNumber = request.phoneNumber().trim();

        if (userRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            throw new UserException("该邮箱已被注册");
        }
        if (userRepository.findByPhoneNumber(phoneNumber).isPresent()) {
            throw new UserException("该手机号已被注册");
        }

        User newUser = User.builder()
                .email(normalizedEmail)
                .phoneNumber(phoneNumber)
                .yijiaId(generateUniqueYijiaId())
                .password(passwordEncoder.encode(request.password()))
                .fullName(request.fullName().trim())
                .build();

        return userRepository.save(newUser);
    }

    @Override
    public List<ContactEntry> findContacts(UUID userId) {
        return contactEntryRepository.findByOwner_IdOrderByCreatedAtAsc(userId);
    }

    @Override
    public FriendRequest sendFriendRequest(User owner, AddFriendRequestDTO request) throws UserException {
        if (request.friendId() == null) {
            throw new UserException("请选择要添加的好友");
        }

        User friend = findUserById(request.friendId());
        if (owner.getId().equals(friend.getId())) {
            throw new UserException("不能添加自己为好友");
        }
        if (isAlreadyFriends(owner.getId(), friend.getId())) {
            throw new UserException("你们已经是好友了");
        }

        Optional<FriendRequest> reverseRequest = friendRequestRepository.findBySender_IdAndReceiver_Id(friend.getId(), owner.getId());
        if (reverseRequest.isPresent() && reverseRequest.get().getStatus() == FriendRequestStatus.PENDING) {
            throw new UserException("对方已经向你发送好友申请，请先通过对方的申请");
        }

        Optional<FriendRequest> existing = friendRequestRepository.findBySender_IdAndReceiver_Id(owner.getId(), friend.getId());
        if (existing.isPresent()) {
            FriendRequest friendRequest = existing.get();
            if (friendRequest.getStatus() == FriendRequestStatus.PENDING) {
                return friendRequest;
            }

            friendRequest.setStatus(FriendRequestStatus.PENDING);
            friendRequest.setRemarkName(blankToNull(request.remarkName()));
            friendRequest.setCreatedAt(LocalDateTime.now());
            friendRequest.setRespondedAt(null);
            return friendRequestRepository.save(friendRequest);
        }

        FriendRequest friendRequest = FriendRequest.builder()
                .sender(owner)
                .receiver(friend)
                .remarkName(blankToNull(request.remarkName()))
                .status(FriendRequestStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        return friendRequestRepository.save(friendRequest);
    }

    @Override
    public List<FriendRequest> getIncomingFriendRequests(UUID userId) {
        return friendRequestRepository.findByReceiver_IdAndStatusOrderByCreatedAtDesc(userId, FriendRequestStatus.PENDING);
    }

    @Override
    public List<FriendRequest> getOutgoingFriendRequests(UUID userId) {
        return friendRequestRepository.findBySender_IdAndStatusOrderByCreatedAtDesc(userId, FriendRequestStatus.PENDING);
    }

    @Override
    public FriendRequest approveFriendRequest(User owner, UUID requestId) throws UserException {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new UserException("好友申请不存在"));

        if (!request.getReceiver().getId().equals(owner.getId())) {
            throw new UserException("你没有权限处理这条好友申请");
        }
        if (request.getStatus() != FriendRequestStatus.PENDING) {
            throw new UserException("这条好友申请已经处理过了");
        }

        request.setStatus(FriendRequestStatus.APPROVED);
        request.setRespondedAt(LocalDateTime.now());
        ensureContactPair(request.getSender(), request.getReceiver(), request.getRemarkName());
        return friendRequestRepository.save(request);
    }

    @Override
    public FriendRequest rejectFriendRequest(User owner, UUID requestId) throws UserException {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new UserException("好友申请不存在"));

        if (!request.getReceiver().getId().equals(owner.getId())) {
            throw new UserException("你没有权限处理这条好友申请");
        }
        if (request.getStatus() != FriendRequestStatus.PENDING) {
            throw new UserException("这条好友申请已经处理过了");
        }

        request.setStatus(FriendRequestStatus.REJECTED);
        request.setRespondedAt(LocalDateTime.now());
        return friendRequestRepository.save(request);
    }

    @Override
    public ContactEntry updateRemark(User owner, UUID friendId, UpdateRemarkRequestDTO request) throws UserException {
        ContactEntry contactEntry = contactEntryRepository.findByOwner_IdAndFriend_Id(owner.getId(), friendId)
                .orElseThrow(() -> new UserException("未找到该联系人"));
        contactEntry.setRemarkName(blankToNull(request.remarkName()));
        return contactEntryRepository.save(contactEntry);
    }

    private void validateRegistrationRequest(UpdateUserRequestDTO request) throws UserException {
        if (request == null) {
            throw new UserException("注册信息不能为空");
        }
        if (request.fullName() == null || request.fullName().isBlank()) {
            throw new UserException("请输入姓名");
        }
        if (request.email() == null || request.email().isBlank()) {
            throw new UserException("请输入邮箱");
        }
        if (!request.email().contains("@")) {
            throw new UserException("请输入正确的邮箱地址");
        }
        if (request.phoneNumber() == null || request.phoneNumber().isBlank()) {
            throw new UserException("请输入手机号");
        }
        if (!request.phoneNumber().matches("^1\\d{10}$")) {
            throw new UserException("请输入正确的 11 位手机号");
        }
        if (request.password() == null || request.password().isBlank()) {
            throw new UserException("请输入密码");
        }
    }

    private String generateUniqueYijiaId() {
        String yijiaId;
        do {
            yijiaId = "YJ" + ThreadLocalRandom.current().nextInt(10000000, 99999999);
        } while (userRepository.findByYijiaId(yijiaId).isPresent());
        return yijiaId;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private boolean isAlreadyFriends(UUID ownerId, UUID friendId) {
        return contactEntryRepository.findByOwner_IdAndFriend_Id(ownerId, friendId).isPresent()
                || contactEntryRepository.findByOwner_IdAndFriend_Id(friendId, ownerId).isPresent();
    }

    private void ensureContactPair(User sender, User receiver, String senderRemarkName) {
        if (contactEntryRepository.findByOwner_IdAndFriend_Id(sender.getId(), receiver.getId()).isEmpty()) {
            contactEntryRepository.save(ContactEntry.builder()
                    .owner(sender)
                    .friend(receiver)
                    .remarkName(blankToNull(senderRemarkName))
                    .createdAt(LocalDateTime.now())
                    .build());
        }

        if (contactEntryRepository.findByOwner_IdAndFriend_Id(receiver.getId(), sender.getId()).isEmpty()) {
            contactEntryRepository.save(ContactEntry.builder()
                    .owner(receiver)
                    .friend(sender)
                    .createdAt(LocalDateTime.now())
                    .build());
        }
    }
}

