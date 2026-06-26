import {Avatar, Badge, Chip} from "@mui/material";
import React from "react";
import {getChatName, getInitialsFromName, transformDateToString} from "../utils/Utils";
import styles from './ChatCard.module.scss';
import {ChatDTO} from "../../redux/chat/ChatModel";
import {useSelector} from "react-redux";
import {RootState} from "../../redux/Store";
import {MessageDTO} from "../../redux/message/MessageModel";
import Groups2Icon from '@mui/icons-material/Groups2';
import PersonIcon from '@mui/icons-material/Person';
import {UserPresenceDTO} from "../../redux/auth/AuthModel";

interface ChatCardProps {
    chat: ChatDTO;
}

const ChatCard = (props: ChatCardProps) => {

    const authState = useSelector((state: RootState) => state.auth);

    const name: string = getChatName(props.chat, authState.reqUser);
    const initials: string = getInitialsFromName(name);
    const peerUser = !props.chat.isGroup ? props.chat.users.find(user => user.id !== authState.reqUser?.id) : null;
    const peerPresence: UserPresenceDTO | undefined = authState.users?.find(user => user.id === peerUser?.id);
    const sortedMessages: MessageDTO[] = props.chat.messages.sort((a, b) => +new Date(a.timeStamp) - +new Date(b.timeStamp));
    const lastMessage: MessageDTO | undefined = sortedMessages.length > 0 ? sortedMessages[sortedMessages.length - 1] : undefined;
    const lastMessageBody = lastMessage?.fileName ? `[文件] ${lastMessage.fileName}` : lastMessage?.content || "";
    const lastMessageContent: string = lastMessageBody.length > 25 ? lastMessageBody.slice(0, 25) + "..." : lastMessageBody;
    const lastMessageName: string = lastMessage ? lastMessage.user.fullName === authState.reqUser?.fullName ? "你" : lastMessage.user.fullName : "";
    const lastMessageString: string = lastMessage ? lastMessageName + ": " + lastMessageContent : "";
    const lastDate: string = lastMessage ? transformDateToString(new Date(lastMessage.timeStamp)) : "";
    const currentUserId = authState.reqUser?.id;
    const numberOfReadMessages: number = props.chat.messages.filter(msg =>
        msg.user.id === currentUserId || (!!currentUserId && msg.readBy.includes(currentUserId))).length;
    const numberOfUnreadMessages: number = props.chat.messages.length - numberOfReadMessages;

    return (
        <div className={styles.chatCardOuterContainer}>
            <div className={styles.chatCardAvatarContainer}>
                <Avatar sx={{
                    width: '2.5rem',
                    height: '2.5rem',
                    fontSize: '1rem',
                    mr: '0.75rem',
                    backgroundColor: props.chat.isGroup ? '#1d4ed8' : '#2563eb'
                }}>
                    {initials}
                </Avatar>
            </div>
            <div className={styles.chatCardContentContainer}>
                <div className={styles.chatCardContentInnerContainer}>
                    <div className={styles.nameRow}>
                        <p className={styles.chatCardLargeTextContainer}>{name}</p>
                        <Chip
                            size="small"
                            icon={props.chat.isGroup ? <Groups2Icon/> : <PersonIcon/>}
                            label={props.chat.isGroup ? "群聊" : (peerPresence?.online ? "在线" : "单聊")}
                            className={props.chat.isGroup ? styles.groupChip : (peerPresence?.online ? styles.onlineChip : styles.singleChip)}
                        />
                    </div>
                    <p className={styles.chatCardSmallTextContainer}>{lastDate}</p>
                </div>
                <div className={styles.chatCardContentInnerContainer}>
                    <p className={styles.chatCardSmallTextContainer}>{lastMessageString}</p>
                    {numberOfUnreadMessages > 0 && <Badge badgeContent={numberOfUnreadMessages} color='primary' sx={{mr: '0.75rem'}}/>}
                </div>
            </div>
        </div>
    );
};

export default ChatCard;
