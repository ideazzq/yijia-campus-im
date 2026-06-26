import {UUID} from "node:crypto";
import {UserDTO} from "../auth/AuthModel";
import {ChatDTO} from "../chat/ChatModel";

export interface MessageDTO {
    id: UUID;
    content: string;
    fileName?: string | null;
    fileType?: string | null;
    fileSize?: number | null;
    fileDownloadUrl?: string | null;
    timeStamp: string;
    user: UserDTO;
    readBy: UUID[];
}

export interface WebSocketMessageDTO {
    id: UUID;
    content: string;
    fileName?: string | null;
    fileType?: string | null;
    fileSize?: number | null;
    fileDownloadUrl?: string | null;
    timeStamp: string;
    user: UserDTO;
    chat: ChatDTO;
}

export interface AdminBroadcastPacketDTO {
    type: string;
    title?: string;
    encryptedPayload: string;
    issuedAt: string;
}

export interface SendMessageRequestDTO {
    chatId: UUID;
    content: string;
}

export type MessageReducerState = {
    messages: MessageDTO[];
    newMessage: MessageDTO | null;
    uploadProgress: number;
}
