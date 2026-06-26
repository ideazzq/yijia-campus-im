package com.nicolas.chatapp.controllers;

import com.nicolas.chatapp.config.JwtConstants;
import com.nicolas.chatapp.dto.request.SendMessageRequestDTO;
import com.nicolas.chatapp.dto.response.ApiResponseDTO;
import com.nicolas.chatapp.dto.response.MessageDTO;
import com.nicolas.chatapp.exception.ChatException;
import com.nicolas.chatapp.exception.MessageException;
import com.nicolas.chatapp.exception.UserException;
import com.nicolas.chatapp.model.Message;
import com.nicolas.chatapp.model.User;
import com.nicolas.chatapp.service.MessageService;
import com.nicolas.chatapp.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/messages")
public class MessageController {

    private final UserService userService;
    private final MessageService messageService;

    @PostMapping("/create")
    public ResponseEntity<MessageDTO> sendMessage(@RequestBody SendMessageRequestDTO req,
                                                  @RequestHeader(JwtConstants.TOKEN_HEADER) String jwt)
            throws ChatException, UserException {

        User user = userService.findUserByProfile(jwt);
        Message message = messageService.sendMessage(req, user.getId());
        log.info("User {} sent message: {}", user.getEmail(), message.getId());

        return new ResponseEntity<>(MessageDTO.fromMessage(message), HttpStatus.OK);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MessageDTO> uploadFile(@RequestParam("chatId") UUID chatId,
                                                 @RequestPart("file") MultipartFile file,
                                                 @RequestHeader(JwtConstants.TOKEN_HEADER) String jwt)
            throws ChatException, UserException {

        User user = userService.findUserByProfile(jwt);
        Message message = messageService.sendFile(chatId, user.getId(), file);
        log.info("User {} uploaded file message: {}", user.getEmail(), message.getId());

        return new ResponseEntity<>(MessageDTO.fromMessage(message), HttpStatus.OK);
    }

    @GetMapping("/chat/{chatId}")
    public ResponseEntity<List<MessageDTO>> getChatMessages(@PathVariable UUID chatId,
                                                         @RequestHeader(JwtConstants.TOKEN_HEADER) String jwt)
            throws ChatException, UserException {

        User user = userService.findUserByProfile(jwt);
        List<Message> messages = messageService.getChatMessages(chatId, user);

        return new ResponseEntity<>(MessageDTO.fromMessages(messages), HttpStatus.OK);
    }

    @GetMapping("/file/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable UUID id,
                                                 @RequestHeader(JwtConstants.TOKEN_HEADER) String jwt)
            throws UserException, MessageException {

        User user = userService.findUserByProfile(jwt);
        Message message = messageService.findMessageById(id, user);
        Resource resource = new FileSystemResource(Path.of(message.getFilePath()));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + message.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(message.getFileType()))
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO> deleteMessage(@PathVariable UUID id,
                                                        @RequestHeader(JwtConstants.TOKEN_HEADER) String jwt)
            throws UserException, MessageException {

        User user = userService.findUserByProfile(jwt);
        messageService.deleteMessageById(id, user);
        log.info("User {} deleted message: {}", user.getEmail(), id);

        ApiResponseDTO res = ApiResponseDTO.builder()
                .message("Message deleted successfully")
                .status(true)
                .build();

        return new ResponseEntity<>(res, HttpStatus.OK);
    }

}
