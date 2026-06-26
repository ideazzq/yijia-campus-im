import {MessageDTO} from "../../redux/message/MessageModel";
import {UserDTO} from "../../redux/auth/AuthModel";
import styles from './MessageCard.module.scss';
import {Button, Chip} from "@mui/material";
import React from "react";
import {getDateFormat} from "../utils/Utils";
import DownloadIcon from '@mui/icons-material/Download';
import {BASE_API_URL, TOKEN} from "../../config/Config";
import {AUTHORIZATION_PREFIX} from "../../redux/Constants";

interface MessageCardProps {
    message: MessageDTO;
    reqUser: UserDTO | null;
    isNewDate: boolean;
    isGroup: boolean;
}

const MessageCard = (props: MessageCardProps) => {

    const isOwnMessage = props.message.user.id === props.reqUser?.id;
    const currentUserId = props.reqUser?.id;
    const date: Date = new Date(props.message.timeStamp);
    const hours = date.getHours() > 9 ? date.getHours().toString() : "0" + date.getHours();
    const minutes = date.getMinutes() > 9 ? date.getMinutes().toString() : "0" + date.getMinutes();
    const readCount = props.message.readBy?.filter(userId => userId !== props.message.user.id).length || 0;
    const isReadByPeer = Boolean(
        isOwnMessage &&
        currentUserId &&
        props.message.readBy?.some(userId => userId !== currentUserId)
    );
    const readStatus = props.isGroup
        ? `已读 ${readCount} 人`
        : (isReadByPeer ? "已读" : "未读");
    const onDownloadFile = async () => {
        const token = localStorage.getItem(TOKEN);
        if (!token || !props.message.fileDownloadUrl) {
            return;
        }
        const response = await fetch(`${BASE_API_URL}${props.message.fileDownloadUrl}`, {
            headers: {
                Authorization: `${AUTHORIZATION_PREFIX}${token}`,
            },
        });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = props.message.fileName || "下载文件";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    const label: React.ReactElement = (
        <div className={styles.bubbleContainer}>
            {props.isGroup && !isOwnMessage && <h4 className={styles.contentContainer}>{props.message.user.fullName}:</h4>}
            <p className={styles.contentContainer}>{props.message.content}</p>
            {props.message.fileName && (
                <div className={styles.fileCard}>
                    <div>
                        <p className={styles.fileName}>{props.message.fileName}</p>
                        <p className={styles.fileMeta}>
                            {props.message.fileSize ? `${Math.ceil(props.message.fileSize / 1024)} KB` : "文件"}
                        </p>
                    </div>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DownloadIcon/>}
                        onClick={onDownloadFile}>
                        下载
                    </Button>
                </div>
            )}
            <div className={styles.metaRow}>
                <p className={styles.readState}>{isOwnMessage ? readStatus : ""}</p>
                <p className={styles.timeContainer}>{hours + ":" + minutes}</p>
            </div>
        </div>
    );

    const dateLabel: React.ReactElement = (
      <p>{getDateFormat(date)}</p>
    );

    return (
        <div className={styles.messageCardInnerContainer}>
            {props.isNewDate && <div className={styles.date}>{<Chip label={dateLabel}
                                                                    sx={{height: 'auto', width: 'auto', backgroundColor: '#e8f1ff', color: '#1d4ed8'}}/>}</div>}
            <div className={isOwnMessage ? styles.ownMessage : styles.othersMessage}>
                <Chip label={label}
                      sx={{height: 'auto', width: 'auto', backgroundColor: isOwnMessage ? '#dbeafe' : 'white', ml: '0.75rem'}}/>
            </div>
        </div>
    );
};

export default MessageCard;
