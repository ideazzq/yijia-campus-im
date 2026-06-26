import styles from "./Homepage.module.scss";
import React, {useEffect, useMemo, useState} from "react";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../redux/Store";
import {BASE_API_URL, TOKEN} from "../config/Config";
import EditGroupChat from "./editChat/EditGroupChat";
import Profile from "./profile/Profile";
import {
    Alert,
    Avatar,
    Divider,
    IconButton,
    InputAdornment,
    Menu,
    MenuItem,
    Snackbar,
    TextField
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
    addFriend,
    approveFriendRequest,
    clearAuthFeedback,
    currentUser,
    getAllUsers,
    getContacts,
    getIncomingFriendRequests,
    getOutgoingFriendRequests,
    logoutUser,
    rejectFriendRequest,
    searchUser,
    updateRemark
} from "../redux/auth/AuthAction";
import SearchIcon from "@mui/icons-material/Search";
import {getUserChats, markChatAsRead} from "../redux/chat/ChatAction";
import {ChatDTO} from "../redux/chat/ChatModel";
import ChatCard from "./chatCard/ChatCard";
import {getInitialsFromName} from "./utils/Utils";
import ClearIcon from "@mui/icons-material/Clear";
import WelcomePage from "./welcomePage/WelcomePage";
import MessagePage from "./messagePage/MessagePage";
import {AdminBroadcastPacketDTO, MessageDTO, WebSocketMessageDTO} from "../redux/message/MessageModel";
import {createMessage, getAllMessages} from "../redux/message/MessageAction";
import SockJS from "sockjs-client";
import {Client, over, Subscription} from "stompjs";
import {AUTHORIZATION_PREFIX} from "../redux/Constants";
import CreateGroupChat from "./editChat/CreateGroupChat";
import CreateSingleChat from "./editChat/CreateSingleChat";
import OnlineUsersPanel from "./onlineUsers/OnlineUsersPanel";
import {decryptBroadcastPacket} from "./admin/adminCrypto";
import {createChat} from "../redux/chat/ChatAction";

const Homepage = () => {
    const authState = useSelector((state: RootState) => state.auth);
    const chatState = useSelector((state: RootState) => state.chat);
    const messageState = useSelector((state: RootState) => state.message);
    const navigate: NavigateFunction = useNavigate();
    const dispatch: AppDispatch = useDispatch();
    const token: string | null = localStorage.getItem(TOKEN);

    const [isShowEditGroupChat, setIsShowEditGroupChat] = useState(false);
    const [isShowCreateGroupChat, setIsShowCreateGroupChat] = useState(false);
    const [isShowCreateSingleChat, setIsShowCreateSingleChat] = useState(false);
    const [isShowProfile, setIsShowProfile] = useState(false);
    const [anchor, setAnchor] = useState<null | HTMLElement>(null);
    const [initials, setInitials] = useState("");
    const [query, setQuery] = useState("");
    const [focused, setFocused] = useState(false);
    const [currentChat, setCurrentChat] = useState<ChatDTO | null>(null);
    const [messages, setMessages] = useState<MessageDTO[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [stompClient, setStompClient] = useState<Client | undefined>();
    const [isConnected, setIsConnected] = useState(false);
    const [messageReceived, setMessageReceived] = useState(false);
    const [subscribeTry, setSubscribeTry] = useState(1);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null);

    const open = Boolean(anchor);

    useEffect(() => {
        document.title = "翼家校园通信系统";
    }, []);

    useEffect(() => {
        if (token && !authState.reqUser) {
            dispatch(currentUser(token));
        }
    }, [token, dispatch, authState.reqUser]);

    useEffect(() => {
        if (!token && authState.reqUser === null) {
            navigate("/signin");
        }
    }, [token, navigate, authState.reqUser]);

    useEffect(() => {
        if (!token) {
            return;
        }
        dispatch(getAllUsers(token));
        dispatch(getContacts(token));
        dispatch(getIncomingFriendRequests(token));
        dispatch(getOutgoingFriendRequests(token));
        const interval = setInterval(() => {
            dispatch(getAllUsers(token));
            dispatch(getContacts(token));
            dispatch(getIncomingFriendRequests(token));
            dispatch(getOutgoingFriendRequests(token));
        }, 8000);
        return () => clearInterval(interval);
    }, [token, dispatch]);

    useEffect(() => {
        if (authState.reqUser?.fullName) {
            setInitials(getInitialsFromName(authState.reqUser.fullName));
        }
    }, [authState.reqUser?.fullName]);

    useEffect(() => {
        if (token) {
            dispatch(getUserChats(token));
        }
    }, [
        chatState.createdChat,
        chatState.createdGroup,
        dispatch,
        token,
        messageState.newMessage,
        chatState.deletedChat,
        chatState.editedGroup,
        chatState.markedAsReadChat
    ]);

    useEffect(() => {
        if (chatState.editedGroup) {
            setCurrentChat(chatState.editedGroup);
        }
    }, [chatState.editedGroup]);

    useEffect(() => {
        if (currentChat?.id && token) {
            dispatch(getAllMessages(currentChat.id, token));
        }
    }, [currentChat, dispatch, token, messageState.newMessage]);

    useEffect(() => {
        setMessages(messageState.messages);
    }, [messageState.messages]);

    useEffect(() => {
        if (messageState.newMessage && stompClient && currentChat && isConnected) {
            if (!currentChat.messages.some((message) => message.id === messageState.newMessage?.id)) {
                const webSocketMessage: WebSocketMessageDTO = {...messageState.newMessage, chat: currentChat};
                stompClient.send("/app/messages", {}, JSON.stringify(webSocketMessage));
            }
        }
    }, [messageState.newMessage, stompClient, currentChat, isConnected]);

    useEffect(() => {
        if (isConnected && stompClient && stompClient.connected && authState.reqUser) {
            const subscription: Subscription = stompClient.subscribe(
                `/topic/${authState.reqUser.id.toString()}`,
                onMessageReceive
            );
            return () => subscription.unsubscribe();
        }
        if (token) {
            const timeout = setTimeout(() => setSubscribeTry((value) => value + 1), 500);
            return () => clearTimeout(timeout);
        }
    }, [subscribeTry, isConnected, stompClient, authState.reqUser, token]);

    useEffect(() => {
        if (messageReceived && currentChat?.id && token) {
            dispatch(markChatAsRead(currentChat.id, token));
            dispatch(getAllMessages(currentChat.id, token));
        }
        if (token) {
            dispatch(getUserChats(token));
        }
        setMessageReceived(false);
    }, [messageReceived, currentChat?.id, token, dispatch]);

    useEffect(() => {
        if (currentChat?.id && token) {
            dispatch(getAllMessages(currentChat.id, token));
        }
    }, [currentChat?.id, chatState.markedAsReadChat, dispatch, token]);

    useEffect(() => {
        if (!currentChat?.id || !token) {
            return;
        }
        const interval = setInterval(() => {
            dispatch(getAllMessages(currentChat.id, token));
        }, 4000);
        return () => clearInterval(interval);
    }, [currentChat?.id, dispatch, token]);

    useEffect(() => {
        if (token) {
            connect();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    useEffect(() => {
        if (authState.successMessage || authState.errorMessage || broadcastMessage) {
            setSnackbarOpen(true);
        }
    }, [authState.successMessage, authState.errorMessage, broadcastMessage]);

    const filteredChats = useMemo(() => {
        if (query.length === 0) {
            return chatState.chats;
        }
        return chatState.chats.filter((chat) => {
            const chatName = chat.isGroup
                ? chat.chatName.toLowerCase()
                : (chat.users.find((user) => user.id !== authState.reqUser?.id)?.fullName || "").toLowerCase();
            return chatName.includes(query);
        });
    }, [chatState.chats, query, authState.reqUser?.id]);

    const connect = () => {
        const headers = {
            Authorization: `${AUTHORIZATION_PREFIX}${token}`
        };

        const socket: WebSocket = new SockJS(`${BASE_API_URL}/ws`);
        const client: Client = over(socket);
        client.connect(headers, () => setTimeout(() => setIsConnected(true), 1000), onError);
        setStompClient(client);
    };

    const onError = (error: any) => {
        console.error("WebSocket connection error", error);
    };

    const onMessageReceive = async (payload: any) => {
        try {
            const data = JSON.parse(payload.body) as Partial<WebSocketMessageDTO & AdminBroadcastPacketDTO>;
            if (data.type === "ADMIN_BROADCAST" && data.encryptedPayload) {
                const decrypted = await decryptBroadcastPacket(data.encryptedPayload);
                const parsed = JSON.parse(decrypted) as {title: string; content: string};
                setBroadcastMessage(`${parsed.title}：${parsed.content}`);
                return;
            }
        } catch (error) {
            console.error("Broadcast parse failed", error);
        }

        setMessageReceived(true);
    };

    const onSendMessage = () => {
        if (currentChat?.id && token && newMessage.trim()) {
            dispatch(createMessage({chatId: currentChat.id, content: newMessage}, token));
            setNewMessage("");
        }
    };

    const onLogout = async () => {
        await dispatch(logoutUser());
        navigate("/");
    };

    const onClickChat = (chat: ChatDTO) => {
        if (token) {
            dispatch(markChatAsRead(chat.id, token));
        }
        setCurrentChat(chat);
    };

    const openChatByUserId = async (userId: string) => {
        const selectedUser = authState.users?.find((item) => String(item.id) === userId)
            || authState.searchUser?.find((item) => String(item.id) === userId)
            || authState.contacts?.find((item) => String(item.friend.id) === userId)?.friend;
        if (!selectedUser || !token) {
            return;
        }
        const chat = await dispatch(createChat(selectedUser.id, token));
        if (chat) {
            setCurrentChat(chat);
            dispatch(getUserChats(token));
        }
    };

    const getSearchEndAdornment = () => (
        query.length > 0 ? (
            <InputAdornment position="end">
                <IconButton onClick={() => setQuery("")}>
                    <ClearIcon/>
                </IconButton>
            </InputAdornment>
        ) : null
    );

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
        setBroadcastMessage(null);
        dispatch(clearAuthFeedback());
    };

    return (
        <div className={styles.outerContainer}>
            <div className={styles.innerContainer}>
                <div className={styles.sideBarContainer}>
                    {isShowCreateSingleChat && <CreateSingleChat setIsShowCreateSingleChat={setIsShowCreateSingleChat}/>}
                    {isShowCreateGroupChat && <CreateGroupChat setIsShowCreateGroupChat={setIsShowCreateGroupChat}/>}
                    {isShowEditGroupChat && (
                        <EditGroupChat setIsShowEditGroupChat={setIsShowEditGroupChat} currentChat={currentChat}/>
                    )}
                    {isShowProfile && (
                        <div className={styles.profileContainer}>
                            <Profile onCloseProfile={() => setIsShowProfile(false)} initials={initials}/>
                        </div>
                    )}
                    {!isShowCreateSingleChat && !isShowEditGroupChat && !isShowCreateGroupChat && !isShowProfile && (
                        <div className={styles.sideBarInnerContainer}>
                            <div className={styles.navContainer}>
                                <div onClick={() => setIsShowProfile(true)} className={styles.userInfoContainer}>
                                    <Avatar sx={{width: "2.75rem", height: "2.75rem", fontSize: "1rem", mr: "0.75rem"}}>
                                        {initials}
                                    </Avatar>
                                    <div>
                                        <p className={styles.userName}>{authState.reqUser?.fullName}</p>
                                        <span className={styles.userMeta}>校园号：{authState.reqUser?.yijiaId}</span>
                                    </div>
                                </div>
                                <div>
                                    <IconButton aria-label="发起单聊" onClick={() => setIsShowCreateSingleChat(true)}>
                                        <ChatIcon/>
                                    </IconButton>
                                    <IconButton aria-label="更多功能" onClick={(e) => setAnchor(e.currentTarget)}>
                                        <MoreVertIcon/>
                                    </IconButton>
                                    <Menu anchorEl={anchor} open={open} onClose={() => setAnchor(null)}>
                                        <MenuItem onClick={() => {
                                            setAnchor(null);
                                            setIsShowProfile(true);
                                        }}>个人资料</MenuItem>
                                        <MenuItem onClick={() => {
                                            setAnchor(null);
                                            setIsShowCreateGroupChat(true);
                                        }}>创建群聊</MenuItem>
                                        <MenuItem onClick={onLogout}>退出登录</MenuItem>
                                    </Menu>
                                </div>
                            </div>
                            <div className={styles.searchContainer}>
                                <TextField
                                    id="search"
                                    type="text"
                                    label="搜索会话"
                                    placeholder="输入群聊名或联系人"
                                    size="small"
                                    fullWidth
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value.toLowerCase())}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon/>
                                            </InputAdornment>
                                        ),
                                        endAdornment: getSearchEndAdornment()
                                    }}
                                    InputLabelProps={{
                                        shrink: focused || query.length > 0,
                                        style: {marginLeft: focused || query.length > 0 ? 0 : 30}
                                    }}
                                    onFocus={() => setFocused(true)}
                                    onBlur={() => setFocused(false)}
                                />
                            </div>
                            <div className={styles.chatsContainer}>
                                {filteredChats.map((chat) => (
                                    <div key={String(chat.id)} onClick={() => onClickChat(chat)}>
                                        <Divider/>
                                        <ChatCard chat={chat}/>
                                    </div>
                                ))}
                                {filteredChats.length > 0 ? <Divider/> : null}
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.messagesContainer}>
                    {!currentChat && <WelcomePage reqUser={authState.reqUser}/>}
                    {currentChat && (
                        <MessagePage
                            chat={currentChat}
                            reqUser={authState.reqUser}
                            messages={messages}
                            newMessage={newMessage}
                            setNewMessage={setNewMessage}
                            onSendMessage={onSendMessage}
                            setIsShowEditGroupChat={setIsShowEditGroupChat}
                            setCurrentChat={setCurrentChat}
                        />
                    )}
                </div>

                <div className={styles.onlineUsersContainer}>
                    <OnlineUsersPanel
                        users={authState.users || []}
                        contacts={authState.contacts || []}
                        searchResults={authState.searchUser || []}
                        incomingRequests={authState.incomingFriendRequests}
                        outgoingRequests={authState.outgoingFriendRequests}
                        onSearch={(searchValue) => {
                            if (token && searchValue.trim()) {
                                dispatch(searchUser(searchValue.trim(), token));
                            }
                        }}
                        onAddFriend={async (friendId, remarkName) => {
                            if (token) {
                                await dispatch(addFriend(friendId, remarkName, token));
                            }
                        }}
                        onOpenChat={openChatByUserId}
                        onUpdateRemark={async (friendId, remarkName) => {
                            if (token) {
                                await dispatch(updateRemark(friendId, remarkName, token));
                            }
                        }}
                        onApproveFriendRequest={async (requestId) => {
                            if (token) {
                                await dispatch(approveFriendRequest(requestId, token));
                            }
                        }}
                        onRejectFriendRequest={async (requestId) => {
                            if (token) {
                                await dispatch(rejectFriendRequest(requestId, token));
                            }
                        }}
                    />
                </div>
            </div>

            <Snackbar open={snackbarOpen} autoHideDuration={2600} onClose={handleCloseSnackbar}>
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={authState.errorMessage ? "error" : "success"}
                    variant="filled"
                >
                    {broadcastMessage || authState.errorMessage || authState.successMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Homepage;

