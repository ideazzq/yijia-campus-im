import {ChatDTO} from "../../redux/chat/ChatModel";
import {UserDTO} from "../../redux/auth/AuthModel";

export const getInitialsFromName = (name: string): string => {
    const trimmedName = name.trim();
    const chineseName = trimmedName.replace(/[·•\s]/g, "");

    if (/^[\u4e00-\u9fa5]+$/.test(chineseName)) {
        return chineseName.slice(0, Math.min(2, chineseName.length));
    }

    const splitName: string[] = trimmedName.split(/\s+/);
    if (splitName.length > 1) {
        return `${splitName[0][0]}${splitName[1][0]}`.toUpperCase();
    }

    return trimmedName.slice(0, Math.min(2, trimmedName.length)).toUpperCase();
};

export const transformDateToString = (date: Date): string => {
    const currentDate = new Date();

    if (date.getFullYear() !== currentDate.getFullYear()) {
        return `${date.getFullYear()}年`;
    }

    if (date.getDate() !== currentDate.getDate()) {
        return getMonthDayFormat(date);
    }

    const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    return hours + ":" + minutes;
};

export const getChatName = (chat: ChatDTO, reqUser: UserDTO | null): string => {
    if (chat.isGroup) {
        return chat.chatName;
    }
    const otherUser = chat.users.find(user => user.id !== reqUser?.id);
    return otherUser?.fullName || chat.chatName || "单聊会话";
};

export const getDateFormat = (date: Date): string => {
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    const month = date.getMonth() < 9 ? `0${(date.getMonth() + 1)}` : (date.getMonth() + 1);
    return `${date.getFullYear()}年${month}月${day}日`;
};

export const getMonthDayFormat = (date: Date): string => {
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    const month = date.getMonth() < 9 ? `0${(date.getMonth() + 1)}` : (date.getMonth() + 1);
    return `${month}月${day}日`;
};
