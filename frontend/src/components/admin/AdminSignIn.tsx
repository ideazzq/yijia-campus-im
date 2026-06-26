import React, { useEffect, useState } from "react";
import { Alert, Button, Snackbar, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ADMIN_TOKEN } from "../../config/Config";
import { adminLogin } from "./adminApi";
import styles from "./AdminSignIn.module.scss";
import yijiaLogo from "../../assets/yijia-logo.png";

const presetAdmin = {
    email: "admin@yijia-campus.local",
    password: "YijiaCampusAdmin@123"
};

const AdminSignIn = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState(presetAdmin);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        document.title = "翼家校园通信系统管理端";
        if (localStorage.getItem(ADMIN_TOKEN)) {
            navigate("/admin/dashboard");
        }
    }, [navigate]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const token = await adminLogin(form.email, form.password);
            localStorage.setItem(ADMIN_TOKEN, token);
            setMessage("管理员登录成功，正在进入管理大屏");
            setOpen(true);
            setTimeout(() => navigate("/admin/dashboard"), 500);
        } catch (err: any) {
            setError(err.message || "管理员登录失败");
            setOpen(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.shell}>
                <section className={styles.hero}>
                    <div className={styles.logoWrap}>
                        <img src={yijiaLogo} alt="翼家校园通信系统" className={styles.logo} />
                    </div>
                    <p className={styles.badge}>翼家校园通信系统管理入口</p>
                    <h1>统一查看在线状态、广播通知与系统运行情况</h1>
                    <p className={styles.desc}>
                        管理员账号用于课程设计演示。登录后可进入管理大屏，查看在线用户、
                        系统统计数据并发送广播通知。
                    </p>
                    <div className={styles.tipBox}>
                        <span>管理员账号：admin@yijia-campus.local</span>
                        <span>管理员密码：YijiaCampusAdmin@123</span>
                    </div>
                </section>

                <section className={styles.panel}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2>管理员登录</h2>
                            <p>仅限管理端使用</p>
                        </div>
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <TextField
                                label="管理员邮箱"
                                type="email"
                                value={form.email}
                                onChange={(event) => setForm({ ...form, email: event.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="管理员密码"
                                type="password"
                                value={form.password}
                                onChange={(event) => setForm({ ...form, password: event.target.value })}
                                fullWidth
                            />
                            <Button type="submit" variant="contained" size="large" disabled={loading}>
                                {loading ? "正在登录..." : "进入管理大屏"}
                            </Button>
                        </form>
                        <div className={styles.actions}>
                            <Button variant="text" onClick={() => navigate("/")}>返回首页</Button>
                            <Button variant="text" onClick={() => navigate("/signin")}>用户登录</Button>
                        </div>
                    </div>
                </section>
            </div>

            <Snackbar open={open} autoHideDuration={2500} onClose={() => setOpen(false)}>
                <Alert severity={error ? "error" : "success"} variant="filled" onClose={() => setOpen(false)}>
                    {error || message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default AdminSignIn;
