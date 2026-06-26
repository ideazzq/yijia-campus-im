import {UUID} from "node:crypto";

export interface SignUpRequestDTO {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
}

export interface UpdateUserRequestDTO {
    email?: string;
    password?: string;
    fullName: string;
    phoneNumber?: string;
}

export interface LoginResponseDTO {
    token: string;
    isAuthenticated: boolean;
}

export interface LoginRequestDTO {
    account: string;
    password: string;
}

export interface UserDTO {
    id: UUID;
    email: string;
    fullName: string;
    phoneNumber: string;
    yijiaId: string;
}

export interface UserPresenceDTO extends UserDTO {
    online: boolean;
}

export interface ContactDTO {
    id: UUID;
    friend: UserDTO;
    remarkName?: string | null;
    createdAt: string;
}

export type FriendRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface FriendRequestDTO {
    id: UUID;
    sender: UserDTO;
    receiver: UserDTO;
    remarkName?: string | null;
    status: FriendRequestStatus;
    createdAt: string;
    respondedAt?: string | null;
}

export interface AuthenticationErrorDTO {
    details: string;
    message: string;
}

export interface ErrorResponseDTO {
    error: string;
    message: string;
    timeStamp: string;
}

export interface ApiResponseDTO {
    message: string;
    status: boolean;
}

export type AuthReducerState = {
    signin: LoginResponseDTO | null;
    signup: LoginResponseDTO | null;
    reqUser: UserDTO | null;
    searchUser: UserDTO[] | null;
    users: UserPresenceDTO[] | null;
    contacts: ContactDTO[] | null;
    incomingFriendRequests: FriendRequestDTO[];
    outgoingFriendRequests: FriendRequestDTO[];
    updateUser: ApiResponseDTO | null;
    successMessage: string | null;
    errorMessage: string | null;
};
