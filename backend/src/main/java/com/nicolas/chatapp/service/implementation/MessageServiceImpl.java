package com.nicolas.chatapp.service.implementation;

import com.nicolas.chatapp.dto.request.SendMessageRequestDTO;
import com.nicolas.chatapp.exception.ChatException;
import com.nicolas.chatapp.exception.MessageException;
import com.nicolas.chatapp.exception.UserException;
import com.nicolas.chatapp.model.Chat;
import com.nicolas.chatapp.model.Message;
import com.nicolas.chatapp.model.User;
import com.nicolas.chatapp.repository.MessageRepository;
import com.nicolas.chatapp.service.ChatService;
import com.nicolas.chatapp.service.MessageService;
import com.nicolas.chatapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private static final long MAX_FILE_SIZE = 20 * 1024 * 1024;
    private static final Path UPLOAD_DIR = Path.of(System.getProperty("user.home"), "yijia-uploads");

    private final UserService userService;
    private final ChatService chatService;
    private final MessageRepository messageRepository;

    @Override
    public Message sendMessage(SendMessageRequestDTO req, UUID userId) throws UserException, ChatException {
        User user = userService.findUserById(userId);
        Chat chat = chatService.findChatById(req.chatId());

        if (!chat.getUsers().contains(user)) {
            throw new UserException("你不在该会话中，无法发送消息");
        }

        Message message = Message.builder()
                .chat(chat)
                .user(user)
                .content(req.content())
                .timeStamp(LocalDateTime.now())
                .readBy(new HashSet<>(Set.of(user.getId())))
                .build();

        chat.getMessages().add(message);
        return messageRepository.save(message);
    }

    @Override
    public Message sendFile(UUID chatId, UUID userId, MultipartFile file) throws UserException, ChatException {
        if (file.isEmpty()) {
            throw new ChatException("上传文件不能为空");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ChatException("文件大小不能超过 20MB");
        }

        User user = userService.findUserById(userId);
        Chat chat = chatService.findChatById(chatId);

        if (!chat.getUsers().contains(user)) {
            throw new UserException("你不在该会话中，无法发送文件");
        }

        try {
            Files.createDirectories(UPLOAD_DIR);
            String originalName = Optional.ofNullable(file.getOriginalFilename()).orElse("未命名文件");
            String savedFileName = UUID.randomUUID() + "_" + originalName;
            Path targetPath = UPLOAD_DIR.resolve(savedFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            Message message = Message.builder()
                    .chat(chat)
                    .user(user)
                    .content("[文件] " + originalName)
                    .fileName(originalName)
                    .filePath(targetPath.toString())
                    .fileType(Optional.ofNullable(file.getContentType()).orElse("application/octet-stream"))
                    .fileSize(file.getSize())
                    .timeStamp(LocalDateTime.now())
                    .readBy(new HashSet<>(Set.of(user.getId())))
                    .build();

            chat.getMessages().add(message);
            return messageRepository.save(message);
        } catch (IOException e) {
            throw new ChatException("文件保存失败");
        }
    }

    @Override
    public List<Message> getChatMessages(UUID chatId, User reqUser) throws UserException, ChatException {
        Chat chat = chatService.findChatById(chatId);

        if (!chat.getUsers().contains(reqUser)) {
            throw new UserException("你无权查看当前会话");
        }

        return messageRepository.findByChat_IdOrderByTimeStampAsc(chat.getId());
    }

    @Override
    public Message findMessageById(UUID messageId) throws MessageException {
        return messageRepository.findById(messageId)
                .orElseThrow(() -> new MessageException("未找到对应消息"));
    }

    @Override
    public Message findMessageById(UUID messageId, User reqUser) throws MessageException, UserException {
        Message message = findMessageById(messageId);
        if (!message.getChat().getUsers().contains(reqUser)) {
            throw new UserException("你没有权限访问该文件");
        }
        return message;
    }

    @Override
    public void deleteMessageById(UUID messageId, User reqUser) throws UserException, MessageException {
        Message message = findMessageById(messageId);

        if (message.getUser().getId().equals(reqUser.getId())) {
            messageRepository.deleteById(messageId);
            return;
        }

        throw new UserException("你不能删除这条消息");
    }
}
