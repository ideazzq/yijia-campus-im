import {BASE_API_URL} from "../../config/Config";
import * as actionTypes from "./ChatActionType";
import {UUID} from "node:crypto";
import {ChatDTO, GroupChatRequestDTO} from "./ChatModel";
import {AUTHORIZATION_PREFIX} from "../Constants";
import {AppDispatch} from "../Store";
import {ApiResponseDTO} from "../auth/AuthModel";

const CHAT_PATH = "api/chats";

const authHeaders = (token: string) => ({
    "Content-Type": "application/json",
    Authorization: `${AUTHORIZATION_PREFIX}${token}`,
});

export const createChat = (userId: UUID, token: string) => async (dispatch: AppDispatch): Promise<ChatDTO | null> => {
    try {
        const res = await fetch(`${BASE_API_URL}/${CHAT_PATH}/single`, {
            method: "POST",
            headers: authHeaders(token),
            body: JSON.stringify(userId),
        });

        if (!res.ok) {
            return null;
        }

        const resData: ChatDTO = await res.json();
        dispatch({type: actionTypes.CREATE_CHAT, payload: resData});
        return resData;
    } catch (error) {
        console.error("Creating single chat failed:", error);
        return null;
    }
};

export const createGroupChat = (data: GroupChatRequestDTO, token: string) => async (
    dispatch: AppDispatch
): Promise<ChatDTO | null> => {
    try {
        const res = await fetch(`${BASE_API_URL}/${CHAT_PATH}/group`, {
            method: "POST",
            headers: authHeaders(token),
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            return null;
        }

        const resData: ChatDTO = await res.json();
        dispatch({type: actionTypes.CREATE_GROUP, payload: resData});
        return resData;
    } catch (error) {
        console.error("Creating group chat failed:", error);
        return null;
    }
};

export const getUserChats = (token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        const res = await fetch(`${BASE_API_URL}/${CHAT_PATH}/user`, {
            method: "GET",
            headers: authHeaders(token),
        });

        const resData: ChatDTO[] = await res.json();
        dispatch({type: actionTypes.GET_ALL_CHATS, payload: resData});
    } catch (error) {
        console.error("Getting user chats failed:", error);
    }
};

export const deleteChat = (id: UUID, token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        const res = await fetch(`${BASE_API_URL}/${CHAT_PATH}/delete/${id}`, {
            method: "DELETE",
            headers: authHeaders(token),
        });

        const resData: ApiResponseDTO = await res.json();
        dispatch({type: actionTypes.DELETE_CHAT, payload: resData});
    } catch (error) {
        console.error("Deleting chat failed:", error);
    }
};

export const addUserToGroupChat = (chatId: UUID, userId: UUID, token: string) => async (
    dispatch: AppDispatch
): Promise<void> => {
    try {
        const res = await fetch(`${BASE_API_URL}/${CHAT_PATH}/${chatId}/add/${userId}`, {
            method: "PUT",
            headers: authHeaders(token),
        });

        const resData: ChatDTO = await res.json();
        dispatch({type: actionTypes.ADD_MEMBER_TO_GROUP, payload: resData});
    } catch (error) {
        console.error("Adding user to group chat failed:", error);
    }
};

export const removeUserFromGroupChat = (chatId: UUID, userId: UUID, token: string) => async (
    dispatch: AppDispatch
): Promise<void> => {
    try {
        const res = await fetch(`${BASE_API_URL}/${CHAT_PATH}/${chatId}/remove/${userId}`, {
            method: "PUT",
            headers: authHeaders(token),
        });

        const resData: ChatDTO = await res.json();
        dispatch({type: actionTypes.ADD_MEMBER_TO_GROUP, payload: resData});
    } catch (error) {
        console.error("Removing user from group chat failed:", error);
    }
};

export const markChatAsRead = (chatId: UUID, token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        const res = await fetch(`${BASE_API_URL}/${CHAT_PATH}/${chatId}/markAsRead`, {
            method: "PUT",
            headers: authHeaders(token),
        });

        const resData: ChatDTO = await res.json();
        dispatch({type: actionTypes.MARK_CHAT_AS_READ, payload: resData});
    } catch (error) {
        console.error("Marking chat as read failed:", error);
    }
};
