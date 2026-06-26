import React, {useEffect, useMemo, useState} from "react";
import {Alert, Button, Chip, Snackbar, TextField} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {ADMIN_TOKEN} from "../../config/Config";
import {
    AdminBroadcastResultDTO,
    AdminDashboardSummaryDTO,
    AdminOnlineUserDTO
} from "./AdminModel";
import {getAdminSummary, getAdminUsers, postAdminBroadcast} from "./adminApi";
import styles from "./AdminDashboard.module.scss";
import yijiaLogo from "../../assets/yijia-logo.png";

const emptySummary: AdminDashboardSummaryDTO = {
    onlineUsers: 0,
    totalUsers: 0,
    totalChats: 0,
    totalMessages: 0,
    serverTime: "",
    packetEncryptionEnabled: false
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState<AdminDashboardSummaryDTO>(emptySummary);
    const [users, setUsers] = useState<AdminOnlineUserDTO[]>([]);
    const [keyword, setKeyword] = useState("");
    const [broadcastTitle, setBroadcastTitle] = useState("系统广播");
    const [broadcastContent, setBroadcastContent] = useState("");
    const [feedback, setFeedback] = useState("");
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
    const token = localStorage.getItem(ADMIN_TOKEN);

    const loadDashboard = async () => {
        if (!token) {
            navigate("/admin/signin");
            return;
        }
        try {
            const [summaryRes, usersRes] = await Promise.all([
                getAdminSummary(token),
                getAdminUsers(token)
            ]);
            setSummary(summaryRes);
            setUsers(usersRes);
        } catch (err: any) {
            setError(err.message || "管理端数据加载失败");
            setOpen(true);
            localStorage.removeItem(ADMIN_TOKEN);
            navigate("/admin/signin");
        }
    };

    useEffect(() => {
        document.title = "翼家校园通信系统管理端";
        loadDashboard();
        const timer = setInterval(loadDashboard, 5000);
        return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredUsers = useMemo(() => {
        const value = keyword.trim().toLowerCase();
        if (!value) {
            return users;
        }
        return users.filter((user) => (
            user.fullName.toLowerCase().includes(value)
            || user.email.toLowerCase().includes(value)
            || user.phoneNumber.includes(value)
            || user.yijiaId.toLowerCase().includes(value)
        ));
    }, [users, keyword]);

    const onlineRatio = useMemo(() => {
        if (!summary.totalUsers) {
            return 0;
        }
        return Math.round(summary.onlineUsers / summary.totalUsers * 100);
    }, [summary.onlineUsers, summary.totalUsers]);

    const handleBroadcast = async () => {
        if (!token) {
            navigate("/admin/signin");
            return;
        }
        if (!broadcastContent.trim()) {
            setError("请输入广播内容");
            setOpen(true);
            return;
        }
        try {
            const result: AdminBroadcastResultDTO = await postAdminBroadcast(token, {
                title: broadcastTitle,
                content: broadcastContent
            });
            setFeedback(`广播已发送，覆盖 ${result.deliveredUsers} 位用户`);
            setBroadcastContent("");
            setOpen(true);
        } catch (err: any) {
            setError(err.message || "广播发送失败");
            setOpen(true);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem(ADMIN_TOKEN);
        navigate("/");
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.brand}>
                    <img src={yijiaLogo} alt="翼家校园通信系统" className={styles.logo}/>
                    <div>
                        <p>翼家校园通信系统管理台</p>
                        <h1>校园即时通信与文件传输系统</h1>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <Chip label={`在线率 ${onlineRatio}%`} color="success" variant="outlined"/>
                    <Button variant="outlined" onClick={() => navigate("/")}>返回首页</Button>
                    <Button variant="contained" onClick={handleLogout}>退出管理员登录</Button>
                </div>
            </header>

            <section className={styles.hero}>
                <div className={styles.heroCopy}>
                    <span className={styles.eyebrow}>管理端实时总览</span>
                    <h2>在线状态、广播能力与系统运行情况一屏掌握</h2>
                    <p>
                        当前管理端支持在线用户查看、周期刷新、广播通知发送以及系统总体运行数据展示，
                        适合课程设计答辩与本地演示。
                    </p>
                </div>
                <div className={styles.heroMeta}>
                    <span>服务器时间：{summary.serverTime ? new Date(summary.serverTime).toLocaleString() : "--"}</span>
                    <span>数据包加密：{summary.packetEncryptionEnabled ? "已启用" : "未启用"}</span>
                </div>
            </section>

            <section className={styles.metrics}>
                <article className={styles.metricCard}>
                    <span>当前在线人数</span>
                    <strong>{summary.onlineUsers}</strong>
                </article>
                <article className={styles.metricCard}>
                    <span>注册用户总数</span>
                    <strong>{summary.totalUsers}</strong>
                </article>
                <article className={styles.metricCard}>
                    <span>会话总数</span>
                    <strong>{summary.totalChats}</strong>
                </article>
                <article className={styles.metricCard}>
                    <span>消息总数</span>
                    <strong>{summary.totalMessages}</strong>
                </article>
            </section>

            <section className={styles.mainGrid}>
                <div className={styles.usersPanel}>
                    <div className={styles.sectionHeader}>
                        <div>
                            <h3>在线用户维护</h3>
                            <p>可按姓名、手机号、邮箱或校园号筛选</p>
                        </div>
                        <TextField
                            size="small"
                            label="搜索用户"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                    <div className={styles.userTable}>
                        <div className={styles.tableHead}>
                            <span>用户</span>
                            <span>校园号</span>
                            <span>手机号</span>
                            <span>状态</span>
                        </div>
                        {filteredUsers.map((user) => (
                            <div className={styles.tableRow} key={user.id}>
                                <div>
                                    <strong>{user.fullName}</strong>
                                    <p>{user.email}</p>
                                </div>
                                <span>{user.yijiaId}</span>
                                <span>{user.phoneNumber}</span>
                                <div className={styles.statusCol}>
                                    <Chip
                                        size="small"
                                        label={user.online ? "在线" : "离线"}
                                        color={user.online ? "success" : "default"}
                                    />
                                    <small>{user.lastSeen ? `最近更新 ${new Date(user.lastSeen).toLocaleTimeString()}` : "暂无记录"}</small>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.broadcastPanel}>
                    <div className={styles.sectionHeader}>
                        <div>
                            <h3>管理员广播</h3>
                            <p>广播将推送到客户端消息区域</p>
                        </div>
                    </div>
                    <div className={styles.broadcastForm}>
                        <TextField
                            label="广播标题"
                            value={broadcastTitle}
                            onChange={(e) => setBroadcastTitle(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="广播内容"
                            value={broadcastContent}
                            onChange={(e) => setBroadcastContent(e.target.value)}
                            fullWidth
                            multiline
                            minRows={5}
                            placeholder="例如：今晚 8 点统一进行课程设计联调，请保持客户端在线。"
                        />
                        <Button variant="contained" onClick={handleBroadcast}>发送广播</Button>
                    </div>
                    <div className={styles.noticeCard}>
                        <h4>当前管理端能力</h4>
                        <ul>
                            <li>在线用户列表维护</li>
                            <li>断线状态自动刷新</li>
                            <li>广播消息统一发送</li>
                            <li>系统统计信息展示</li>
                            <li>答辩演示场景快速切换</li>
                        </ul>
                    </div>
                </div>
            </section>

            <Snackbar open={open} autoHideDuration={2600} onClose={() => {
                setOpen(false);
                setError("");
                setFeedback("");
            }}>
                <Alert
                    severity={error ? "error" : "success"}
                    variant="filled"
                    onClose={() => {
                        setOpen(false);
                        setError("");
                        setFeedback("");
                    }}
                >
                    {error || feedback}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default AdminDashboard;
