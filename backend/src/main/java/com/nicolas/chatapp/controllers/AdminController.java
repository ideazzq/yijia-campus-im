package com.nicolas.chatapp.controllers;

import com.nicolas.chatapp.dto.request.AdminBroadcastRequestDTO;
import com.nicolas.chatapp.dto.response.AdminBroadcastResultDTO;
import com.nicolas.chatapp.dto.response.AdminDashboardSummaryDTO;
import com.nicolas.chatapp.dto.response.AdminOnlineUserDTO;
import com.nicolas.chatapp.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/summary")
    public ResponseEntity<AdminDashboardSummaryDTO> getSummary() {
        return ResponseEntity.ok(adminService.getDashboardSummary());
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminOnlineUserDTO>> getUsers() {
        return ResponseEntity.ok(adminService.getUsersWithPresence());
    }

    @PostMapping("/broadcast")
    public ResponseEntity<AdminBroadcastResultDTO> broadcast(@RequestBody AdminBroadcastRequestDTO request) {
        return ResponseEntity.ok(adminService.broadcastMessage(request));
    }
}
