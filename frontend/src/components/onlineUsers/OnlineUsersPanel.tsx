import React, {useMemo, useState} from "react";
import {
    Avatar,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    Tab,
    Tabs,
    TextField
} from "@mui/material";
import {ContactDTO, FriendRequestDTO, UserDTO, UserPresenceDTO} from "../../redux/auth/AuthModel";
import {getInitialsFromName} from "../utils/Utils";
import styles from "./OnlineUsersPanel.module.scss";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

interface OnlineUsersPanelProps {
    users: UserPresenceDTO[];
    contacts: ContactDTO[];
    searchResults: UserDTO[];
    incomingRequests: FriendRequestDTO[];
    outgoingRequests: FriendRequestDTO[];
    onSearch: (query: string) => void;
    onAddFriend: (friendId: string, remarkName: string) => Promise<void>;
    onUpdateRemark: (friendId: string, remarkName: string) => Promise<void>;
    onApproveFriendRequest: (requestId: string) => Promise<void>;
    onRejectFriendRequest: (requestId: string) => Promise<void>;
    onOpenChat?: (userId: string) => void;
}

const OnlineUsersPanel = ({
    users,
    contacts,
    searchResults,
    incomingRequests,
    outgoingRequests,
    onSearch,
    onAddFriend,
    onUpdateRemark,
    onApproveFriendRequest,
    onRejectFriendRequest,
    onOpenChat
}: OnlineUsersPanelProps) => {
    const [query, setQuery] = useState("");
    const [tab, setTab] = useState<0 | 1 | 2>(0);
    const [remarkDialog, setRemarkDialog] = useState<{friendId: string; remarkName: string} | null>(null);
    const [addDialog, setAddDialog] = useState<{friendId: string; fullName: string} | null>(null);
    const [remarkValue, setRemarkValue] = useState("");

    const contactIdSet = useMemo(() => new Set(contacts.map((contact) => String(contact.friend.id))), [contacts]);
    const pendingSenderIds = useMemo(() => new Set(outgoingRequests.map((request) => String(request.receiver.id))), [outgoingRequests]);
    const onlineUserIds = useMemo(() => new Set(users.filter((user) => user.online).map((user) => String(user.id))), [users]);

    const onOpenRemark = (contact: ContactDTO) => {
        setRemarkDialog({friendId: String(contact.friend.id), remarkName: contact.remarkName || ""});
        setRemarkValue(contact.remarkName || "");
    };

    const onOpenAdd = (user: UserDTO) => {
        setAddDialog({friendId: String(user.id), fullName: user.fullName});
        setRemarkValue("");
    };

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <div>
                    <h3>联系人与申请</h3>
                    <p>支持搜索用户、发送好友申请、通过后进入好友列表</p>
                </div>
                <Chip size="small" label={`好友 ${contacts.length}`}/>
            </div>

            <div className={styles.searchBox}>
                <TextField
                    fullWidth
                    size="small"
                    value={query}
                    onChange={(e) => {
                        const value = e.target.value;
                        setQuery(value);
                        onSearch(value);
                    }}
                    label="搜索用户"
                    placeholder="手机号 / 校园号 / 姓名"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon/>
                            </InputAdornment>
                        )
                    }}
                />
            </div>

            <Tabs
                value={tab}
                onChange={(_, value) => setTab(value)}
                textColor="primary"
                indicatorColor="primary"
                className={styles.tabs}
            >
                <Tab label="搜索结果"/>
                <Tab label="好友列表"/>
                <Tab label="好友申请"/>
            </Tabs>

            {tab === 0 && (
                <div className={styles.section}>
                    <div className={styles.list}>
                        {searchResults.length === 0 && <p className={styles.emptyText}>没有匹配到用户</p>}
                        {searchResults.map((user) => {
                            const isFriend = contactIdSet.has(String(user.id));
                            const isPending = pendingSenderIds.has(String(user.id));
                            return (
                                <div key={String(user.id)} className={styles.item}>
                                    <div className={styles.userMeta}>
                                        <Avatar className={styles.avatar}>{getInitialsFromName(user.fullName)}</Avatar>
                                        <div>
                                            <p className={styles.name}>{user.fullName}</p>
                                            <p className={styles.meta}>校园号：{user.yijiaId}</p>
                                            <p className={styles.meta}>手机号：{user.phoneNumber}</p>
                                        </div>
                                    </div>
                                    <div className={styles.itemActions}>
                                        {onlineUserIds.has(String(user.id)) ? <span className={styles.online}>在线</span> : <span className={styles.offline}>离线</span>}
                                        {!isFriend && !isPending && (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<PersonAddAlt1Icon/>}
                                                onClick={() => onOpenAdd(user)}
                                            >
                                                发申请
                                            </Button>
                                        )}
                                        {isPending && <Chip size="small" label="已发送申请" color="warning"/>}
                                        {isFriend && <Chip size="small" label="已是好友" color="success"/>}
                                        {isFriend && onOpenChat && (
                                            <Button size="small" variant="text" onClick={() => onOpenChat(String(user.id))}>打开会话</Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {tab === 1 && (
                <div className={styles.section}>
                    <div className={styles.list}>
                        {contacts.length === 0 && <p className={styles.emptyText}>暂无好友，先搜索并发送申请吧</p>}
                            {contacts.map((contact) => {
                            return (
                                <div key={String(contact.id)} className={styles.item}>
                                    <div className={styles.userMeta}>
                                        <Avatar className={styles.avatar}>{getInitialsFromName(contact.friend.fullName)}</Avatar>
                                        <div>
                                            <p className={styles.name}>{contact.remarkName || contact.friend.fullName}</p>
                                            <p className={styles.meta}>实名：{contact.friend.fullName}</p>
                                            <p className={styles.meta}>校园号：{contact.friend.yijiaId}</p>
                                            <p className={styles.meta}>手机号：{contact.friend.phoneNumber}</p>
                                        </div>
                                    </div>
                                    <div className={styles.itemActions}>
                                        {onlineUserIds.has(String(contact.friend.id)) ? <span className={styles.online}>在线</span> : <span className={styles.offline}>离线</span>}
                                        <IconButton onClick={() => onOpenRemark(contact)}>
                                            <EditIcon/>
                                        </IconButton>
                                        {onOpenChat && (
                                            <Button size="small" variant="text" onClick={() => onOpenChat(String(contact.friend.id))}>
                                                打开会话
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {tab === 2 && (
                <div className={styles.section}>
                    <div className={styles.subSection}>
                        <div className={styles.sectionTitle}>我收到的申请</div>
                        <div className={styles.list}>
                            {incomingRequests.length === 0 && <p className={styles.emptyText}>暂时没有待处理申请</p>}
                            {incomingRequests.map((request) => (
                                <div key={String(request.id)} className={styles.item}>
                                    <div className={styles.userMeta}>
                                        <Avatar className={styles.avatar}>{getInitialsFromName(request.sender.fullName)}</Avatar>
                                        <div>
                                            <p className={styles.name}>{request.sender.fullName}</p>
                                            <p className={styles.meta}>校园号：{request.sender.yijiaId}</p>
                                            <p className={styles.meta}>备注：{request.remarkName || "未填写"}</p>
                                        </div>
                                    </div>
                                    <div className={styles.itemActions}>
                                        <Button size="small" variant="contained" startIcon={<CheckIcon/>} onClick={() => onApproveFriendRequest(String(request.id))}>
                                            通过
                                        </Button>
                                        <Button size="small" color="inherit" startIcon={<CloseIcon/>} onClick={() => onRejectFriendRequest(String(request.id))}>
                                            拒绝
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.subSection}>
                        <div className={styles.sectionTitle}>我发出的申请</div>
                        <div className={styles.list}>
                            {outgoingRequests.length === 0 && <p className={styles.emptyText}>还没有发出的好友申请</p>}
                            {outgoingRequests.map((request) => (
                                <div key={String(request.id)} className={styles.item}>
                                    <div className={styles.userMeta}>
                                        <Avatar className={styles.avatar}>{getInitialsFromName(request.receiver.fullName)}</Avatar>
                                        <div>
                                            <p className={styles.name}>{request.receiver.fullName}</p>
                                            <p className={styles.meta}>校园号：{request.receiver.yijiaId}</p>
                                            <p className={styles.meta}>状态：等待通过</p>
                                        </div>
                                    </div>
                                    <Chip size="small" label="等待审核" color="warning"/>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <Dialog open={Boolean(addDialog)} onClose={() => setAddDialog(null)} fullWidth maxWidth="xs">
                <DialogTitle>发送好友申请</DialogTitle>
                <DialogContent>
                    <p className={styles.dialogHint}>给 {addDialog?.fullName} 设置一个备注名，可选。</p>
                    <TextField
                        fullWidth
                        autoFocus
                        label="好友备注"
                        placeholder="例如：同桌 / 项目搭档"
                        value={remarkValue}
                        onChange={(e) => setRemarkValue(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddDialog(null)}>取消</Button>
                    <Button
                        variant="contained"
                        onClick={async () => {
                            if (addDialog) {
                                await onAddFriend(addDialog.friendId, remarkValue);
                                setAddDialog(null);
                            }
                        }}
                    >
                        发送申请
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(remarkDialog)} onClose={() => setRemarkDialog(null)} fullWidth maxWidth="xs">
                <DialogTitle>编辑备注</DialogTitle>
                <DialogContent>
                    <p className={styles.dialogHint}>修改联系人显示名称，聊天里也会同步显示。</p>
                    <TextField
                        fullWidth
                        autoFocus
                        label="好友备注"
                        placeholder="请输入备注"
                        value={remarkValue}
                        onChange={(e) => setRemarkValue(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRemarkDialog(null)}>取消</Button>
                    <Button
                        variant="contained"
                        onClick={async () => {
                            if (remarkDialog) {
                                await onUpdateRemark(remarkDialog.friendId, remarkValue);
                                setRemarkDialog(null);
                            }
                        }}
                    >
                        保存备注
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default OnlineUsersPanel;

