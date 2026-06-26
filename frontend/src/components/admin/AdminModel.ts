export interface AdminDashboardSummaryDTO {
    onlineUsers: number;
    totalUsers: number;
    totalChats: number;
    totalMessages: number;
    serverTime: string;
    packetEncryptionEnabled: boolean;
}

export interface AdminOnlineUserDTO {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    yijiaId: string;
    online: boolean;
    lastSeen?: string | null;
}

export interface AdminBroadcastRequestDTO {
    title: string;
    content: string;
}

export interface AdminBroadcastResultDTO {
    title: string;
    content: string;
    deliveredUsers: number;
    sentAt: string;
}
