package com.nicolas.chatapp.service;

import com.nicolas.chatapp.dto.request.SendMessageRequestDTO;
import com.nicolas.chatapp.exception.ChatException;
import com.nicolas.chatapp.exception.MessageException;
import com.nicolas.chatapp.exception.UserException;
import com.nicolas.chatapp.model.Message;
import com.nicolas.chatapp.model.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface MessageService {

    Message sendMessage(SendMessageRequestDTO req, UUID userId) throws UserException, ChatException;

    Message sendFile(UUID chatId, UUID userId, MultipartFile file) throws UserException, ChatException;

    List<Message> getChatMessages(UUID chatId, User reqUser) throws UserException, ChatException;

    Message findMessageById(UUID messageId) throws MessageException;

    Message findMessageById(UUID messageId, User reqUser) throws MessageException, UserException;

    void deleteMessageById(UUID messageId, User reqUser) throws UserException, MessageException;

}
