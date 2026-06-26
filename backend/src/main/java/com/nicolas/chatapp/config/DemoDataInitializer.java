package com.nicolas.chatapp.config;

import com.nicolas.chatapp.model.*;
import com.nicolas.chatapp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DemoDataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final ContactEntryRepository contactEntryRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed-demo-data:true}")
    private boolean seedDemoData;

    @Override
    public void run(ApplicationArguments args) {
        if (!seedDemoData || userRepository.count() > 0) {
            return;
        }

        log.info("Seeding default YiJia demo data");
        seedUsersAndChats();
    }

    private void seedUsersAndChats() {
        User linYan = createUser("lin.yan@yijia.cn", "13800000001", "YJ10000001", "123456", "林妍");
        User zhouChen = createUser("zhou.chen@yijia.cn", "13800000002", "YJ10000002", "123456", "周辰");
        User wangXin = createUser("wang.xin@yijia.cn", "13800000003", "YJ10000003", "123456", "王昕");
        User chenMo = createUser("chen.mo@yijia.cn", "13800000004", "YJ10000004", "123456", "陈墨");
        User liuQing = createUser("liu.qing@yijia.cn", "13800000005", "YJ10000005", "123456", "刘晴");

        createContactPair(linYan, zhouChen, "项目搭档", "林妍");
        createContactPair(linYan, wangXin, "班长", "林妍");

        createPendingRequest(chenMo, linYan, "答辩同组");
        createPendingRequest(liuQing, linYan, null);

        createPrivateChat(
                "答辩配色确认",
                linYan,
                zhouChen,
                List.of(
                        new MessageSeed(linYan, "答辩首页我今晚再润一下，你帮我看看配色。", Set.of(linYan, zhouChen), 80),
                        new MessageSeed(zhouChen, "没问题，我顺便把登录错误提示也补清楚。", Set.of(zhouChen), 72)
                )
        );

        createGroupChat(
                "校园产品讨论组",
                linYan,
                Set.of(linYan),
                Set.of(linYan, zhouChen, wangXin, chenMo),
                List.of(
                        new MessageSeed(linYan, "大家把最终演示素材统一发到群里。", Set.of(linYan, zhouChen, wangXin), 55),
                        new MessageSeed(chenMo, "收到，我先整理项目介绍和部署说明。", Set.of(chenMo), 49)
                )
        );
    }

    private User createUser(String email, String phoneNumber, String yijiaId, String password, String fullName) {
        return userRepository.save(User.builder()
                .email(email)
                .phoneNumber(phoneNumber)
                .yijiaId(yijiaId)
                .password(passwordEncoder.encode(password))
                .fullName(fullName)
                .build());
    }

    private void createContactPair(User userA, User userB, String userARemark, String userBRemark) {
        contactEntryRepository.save(ContactEntry.builder()
                .owner(userA)
                .friend(userB)
                .remarkName(userARemark)
                .createdAt(LocalDateTime.now().minusDays(4))
                .build());

        contactEntryRepository.save(ContactEntry.builder()
                .owner(userB)
                .friend(userA)
                .remarkName(userBRemark)
                .createdAt(LocalDateTime.now().minusDays(4))
                .build());
    }

    private void createPendingRequest(User sender, User receiver, String remarkName) {
        friendRequestRepository.save(FriendRequest.builder()
                .sender(sender)
                .receiver(receiver)
                .remarkName(remarkName)
                .status(FriendRequestStatus.PENDING)
                .createdAt(LocalDateTime.now().minusHours(6))
                .build());
    }

    private void createPrivateChat(String chatName, User firstUser, User secondUser, List<MessageSeed> seeds) {
        Chat chat = chatRepository.save(Chat.builder()
                .chatName(chatName)
                .isGroup(false)
                .createdBy(firstUser)
                .users(new HashSet<>(Set.of(firstUser, secondUser)))
                .messages(new java.util.ArrayList<>())
                .build());

        attachMessages(chat, seeds);
    }

    private void createGroupChat(String chatName, User createdBy, Set<User> admins, Set<User> users, List<MessageSeed> seeds) {
        Chat chat = chatRepository.save(Chat.builder()
                .chatName(chatName)
                .isGroup(true)
                .createdBy(createdBy)
                .admins(new HashSet<>(admins))
                .users(new HashSet<>(users))
                .messages(new java.util.ArrayList<>())
                .build());

        attachMessages(chat, seeds);
    }

    private void attachMessages(Chat chat, List<MessageSeed> seeds) {
        for (MessageSeed seed : seeds) {
            Message message = messageRepository.save(Message.builder()
                    .chat(chat)
                    .user(seed.sender())
                    .content(seed.content())
                    .timeStamp(LocalDateTime.now().minusMinutes(seed.minutesAgo()))
                    .readBy(new HashSet<>(seed.readBy()))
                    .build());
            chat.getMessages().add(message);
        }
        chatRepository.save(chat);
    }

    private record MessageSeed(User sender, String content, Set<User> readUsers, int minutesAgo) {
        private Set<java.util.UUID> readBy() {
            return readUsers.stream()
                    .map(User::getId)
                    .collect(java.util.stream.Collectors.toSet());
        }
    }
}

