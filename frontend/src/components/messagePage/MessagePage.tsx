import {Avatar, Chip, IconButton, InputAdornment, LinearProgress, Menu, MenuItem, TextField} from "@mui/material";
import {getChatName, getInitialsFromName} from "../utils/Utils";
import React, {useEffect, useRef, useState} from "react";
import {ChatDTO} from "../../redux/chat/ChatModel";
import {UserDTO} from "../../redux/auth/AuthModel";
import styles from './MesaggePage.module.scss';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import {MessageDTO} from "../../redux/message/MessageModel";
import MessageCard from "../messageCard/MessageCard";
import SendIcon from '@mui/icons-material/Send';
import ClearIcon from "@mui/icons-material/Clear";
import {AppDispatch} from "../../redux/Store";
import {useDispatch, useSelector} from "react-redux";
import {deleteChat} from "../../redux/chat/ChatAction";
import {TOKEN} from "../../config/Config";
import EmojiPicker from "emoji-picker-react";
import MoodIcon from '@mui/icons-material/Mood';
import {EmojiClickData} from "emoji-picker-react/dist/types/exposedTypes";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import {uploadFileMessage} from "../../redux/message/MessageAction";
import {RootState} from "../../redux/Store";
import Groups2Icon from "@mui/icons-material/Groups2";
import PersonIcon from "@mui/icons-material/Person";

interface MessagePageProps {
    chat: ChatDTO;
    reqUser: UserDTO | null;
    messages: MessageDTO[];
    newMessage: string;
    setNewMessage: (newMessage: string) => void;
    onSendMessage: () => void;
    setIsShowEditGroupChat: (isShowEditGroupChat: boolean) => void;
    setCurrentChat: (chat: ChatDTO | null) => void;
}

const MessagePage = (props: MessagePageProps) => {

    const [messageQuery, setMessageQuery] = useState<string>("");
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [isSearch, setIsSearch] = useState<boolean>(false);
    const [anchor, setAnchor] = useState(null);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const lastMessageRef = useRef<null | HTMLDivElement>(null);
    const dispatch: AppDispatch = useDispatch();
    const uploadProgress = useSelector((state: RootState) => state.message.uploadProgress);
    const users = useSelector((state: RootState) => state.auth.users);
    const open = Boolean(anchor);
    const token: string | null = localStorage.getItem(TOKEN);
    const peerUser = !props.chat.isGroup ? props.chat.users.find(user => user.id !== props.reqUser?.id) : null;
    const peerPresence = users?.find(user => user.id === peerUser?.id);

    useEffect(() => {
        scrollToBottom();
    }, [props]);

    const scrollToBottom = () => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({behavior: "smooth"});
        }
    };

    const onOpenMenu = (e: any) => {
        setAnchor(e.currentTarget);
    };

    const onCloseMenu = () => {
        setAnchor(null);
    };

    const onEditGroupChat = () => {
        onCloseMenu();
        props.setIsShowEditGroupChat(true);
    };

    const onDeleteChat = () => {
        onCloseMenu();
        if (token) {
            dispatch(deleteChat(props.chat.id, token));
            props.setCurrentChat(null);
        }
    };

    const onChangeNewMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsEmojiPickerOpen(false);
        props.setNewMessage(e.target.value);
    };

    const onChangeMessageQuery = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessageQuery(e.target.value.toLowerCase());
    };

    const onChangeSearch = () => {
        setIsSearch(!isSearch);
    };

    const onClearQuery = () => {
        setMessageQuery("");
        setIsSearch(false);
    };

    const getSearchEndAdornment = () => {
        return <InputAdornment position='end'>
            <IconButton onClick={onClearQuery}>
                <ClearIcon/>
            </IconButton>
        </InputAdornment>
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            props.onSendMessage();
        }
    };

    const onOpenEmojiPicker = () => {
        setIsEmojiPickerOpen(true);
    };

    const onCloseEmojiPicker = () => {
        setIsEmojiPickerOpen(false);
    };

    const onEmojiClick = (e: EmojiClickData) => {
        setIsEmojiPickerOpen(false);
        props.setNewMessage(props.newMessage + e.emoji);
    };

    const onChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setSelectedFile(file);
        if (file && token) {
            await dispatch(uploadFileMessage(props.chat.id, file, token));
            setSelectedFile(null);
        }
        e.target.value = "";
    };

    let lastDay = -1;
    let lastMonth = -1;
    let lastYear = -1;

    const getMessageCard = (message: MessageDTO) => {
        const date: Date = new Date(message.timeStamp);
        const isNewDate = lastDay !== date.getDate() || lastMonth !== date.getMonth() || lastYear !== date.getFullYear();
        if (isNewDate) {
            lastDay = date.getDate();
            lastMonth = date.getMonth();
            lastYear = date.getFullYear();
        }
        return <MessageCard message={message} reqUser={props.reqUser} key={message.id} isNewDate={isNewDate}
                            isGroup={props.chat.isGroup}/>
    };

    return (
        <div className={styles.outerMessagePageContainer}>

            {/*Message Page Header*/}
            <div className={styles.messagePageHeaderContainer}>
                <div className={styles.messagePageInnerHeaderContainer}>
                    <div className={styles.messagePageHeaderNameContainer}>
                        <Avatar sx={{
                            width: '2.5rem',
                            height: '2.5rem',
                            fontSize: '1rem',
                            mr: '0.75rem'
                        }}>
                            {getInitialsFromName(getChatName(props.chat, props.reqUser))}
                        </Avatar>
                        <div>
                            <p>{getChatName(props.chat, props.reqUser)}</p>
                            <Chip
                                size="small"
                                icon={props.chat.isGroup ? <Groups2Icon/> : <PersonIcon/>}
                                label={props.chat.isGroup ? "群聊会话" : (peerPresence?.online ? "用户在线" : "用户离线")}
                            />
                        </div>
                    </div>
                    <div className={styles.messagePageHeaderNameContainer}>
                        {!isSearch &&
                            <IconButton onClick={onChangeSearch}>
                                <SearchIcon/>
                            </IconButton>}
                        {isSearch &&
                            <TextField
                                id='searchMessages'
                                type='text'
                                label='搜索消息'
                                placeholder='输入关键字筛选聊天内容'
                                size='small'
                                fullWidth
                                value={messageQuery}
                                onChange={onChangeMessageQuery}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <SearchIcon/>
                                        </InputAdornment>
                                    ),
                                    endAdornment: getSearchEndAdornment(),
                                }}
                                InputLabelProps={{
                                    shrink: isFocused || messageQuery.length > 0,
                                    style: {marginLeft: isFocused || messageQuery.length > 0 ? 0 : 30}
                                }}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}/>}
                        <IconButton onClick={onOpenMenu}>
                            <MoreVertIcon/>
                        </IconButton>
                        <Menu
                            id="basic-menu"
                            anchorEl={anchor}
                            open={open}
                            onClose={onCloseMenu}
                            MenuListProps={{'aria-labelledby': 'basic-button'}}>
                            {props.chat.isGroup && <MenuItem onClick={onEditGroupChat}>编辑群聊</MenuItem>}
                            <MenuItem onClick={onDeleteChat}>
                                {props.chat.isGroup ? '删除群聊' : '删除会话'}
                            </MenuItem>
                        </Menu>
                    </div>
                </div>
            </div>

            {/*Message Page Content*/}
            <div className={styles.messageContentContainer} onClick={onCloseEmojiPicker}>
                {messageQuery.length > 0 &&
                    props.messages.filter(x => x.content.toLowerCase().includes(messageQuery))
                        .map(message => getMessageCard(message))}
                {messageQuery.length === 0 &&
                    props.messages.map(message => getMessageCard(message))}
                <div ref={lastMessageRef}></div>
            </div>

            {/*Message Page Footer*/}
            <div className={styles.footerContainer}>
                {isEmojiPickerOpen ?
                    <div className={styles.emojiOuterContainer}>
                        <div className={styles.emojiContainer}>
                            <EmojiPicker onEmojiClick={onEmojiClick} searchDisabled={true} skinTonesDisabled={true}/>
                        </div>
                    </div> :
                    <div className={styles.emojiButton}>
                        <IconButton onClick={onOpenEmojiPicker}>
                            <MoodIcon/>
                        </IconButton>
                    </div>}
                <div className={styles.fileButton}>
                    <IconButton component="label">
                        <AttachFileIcon/>
                        <input hidden type="file" onChange={onChangeFile}/>
                    </IconButton>
                </div>
                <div className={styles.innerFooterContainer}>
                    {uploadProgress > 0 && (
                        <div className={styles.uploadProgressContainer}>
                            <p className={styles.uploadProgressText}>
                                {selectedFile ? `正在上传：${selectedFile.name}` : "正在上传文件"}
                            </p>
                            <LinearProgress variant="determinate" value={uploadProgress}/>
                        </div>
                    )}
                    <TextField
                        id='newMessage'
                        type='text'
                        label='输入消息'
                        placeholder='输入文本消息，回车可发送'
                        size='small'
                        onKeyDown={onKeyDown}
                        fullWidth
                        value={props.newMessage}
                        onChange={onChangeNewMessage}
                        sx={{backgroundColor: 'white'}}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position='end'>
                                    <IconButton onClick={props.onSendMessage}>
                                        <SendIcon/>
                                    </IconButton>
                                </InputAdornment>),
                        }}/>
                </div>
            </div>
        </div>
    );
};

export default MessagePage;
