package com.nicolas.chatapp.service;

import com.nicolas.chatapp.dto.request.AdminBroadcastRequestDTO;
import com.nicolas.chatapp.dto.response.AdminBroadcastResultDTO;
import com.nicolas.chatapp.dto.response.AdminDashboardSummaryDTO;
import com.nicolas.chatapp.dto.response.AdminOnlineUserDTO;

import java.util.List;

public interface AdminService {

    AdminDashboardSummaryDTO getDashboardSummary();

    List<AdminOnlineUserDTO> getUsersWithPresence();

    AdminBroadcastResultDTO broadcastMessage(AdminBroadcastRequestDTO request);
}
