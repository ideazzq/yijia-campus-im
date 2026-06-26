import React from "react";
import {Button} from "@mui/material";
import {useNavigate} from "react-router-dom";
import styles from "./LandingPage.module.scss";
import yijiaLogo from "../../assets/yijia-logo.png";

const featureList = [
    "单聊与群聊会话",
    "文件传输与进度显示",
    "在线状态查看",
    "历史聊天记录",
    "手机号与校园号加好友",
    "联系人备注与消息已读"
];

const LandingPage = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        document.title = "翼家校园通信系统";
    }, []);

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <p className={styles.eyebrow}>校园即时通信与文件传输桌面系统</p>
                    <div className={styles.headerActions}>
                        <Button
                            variant="text"
                            onClick={() => navigate("/admin/signin")}
                            sx={{
                                color: "#177957",
                                borderRadius: "999px",
                                px: 2
                            }}
                        >
                            管理员登录
                        </Button>
                        <Button
                            variant="text"
                            onClick={() => navigate("/signin")}
                            sx={{
                                color: "#1170ee",
                                borderRadius: "999px",
                                px: 2
                            }}
                        >
                            用户登录
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => navigate("/signup")}
                            sx={{
                                background: "linear-gradient(135deg, #1170ee 0%, #16a56a 100%)",
                                borderRadius: "999px",
                                px: 2.1,
                                boxShadow: "0 10px 24px rgba(17, 112, 238, 0.22)",
                            }}
                        >
                            注册账号
                        </Button>
                    </div>
                </div>
            </header>

            <main className={styles.hero}>
                <div className={styles.logoWrap}>
                    <img src={yijiaLogo} alt="翼家校园通信系统 Logo" className={styles.logo}/>
                </div>

                <div className={styles.copy}>
                    <h1>翼家校园通信系统</h1>
                    <p className={styles.tagline}>面向校园场景的即时通信与文件传输桌面应用</p>
                    <p className={styles.description}>
                        系统支持注册登录、联系人管理、单聊群聊、历史消息、文件传输、在线状态查看
                        与管理员广播，适合作为课程设计成品进行本地演示与提交。
                    </p>
                </div>

                <div className={styles.actions}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate("/signin")}
                        sx={{
                            background: "linear-gradient(135deg, #1170ee 0%, #16a56a 100%)",
                            borderRadius: "999px",
                            px: 3.2,
                            py: 1.1,
                            boxShadow: "0 16px 36px rgba(17, 112, 238, 0.24)",
                        }}
                    >
                        进入用户端
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate("/admin/signin")}
                        sx={{
                            color: "#177957",
                            borderColor: "rgba(22, 165, 106, 0.25)",
                            backgroundColor: "rgba(255, 255, 255, 0.76)",
                            borderRadius: "999px",
                            px: 3.2,
                            py: 1.1,
                            "&:hover": {
                                borderColor: "#16a56a",
                                backgroundColor: "#ffffff"
                            }
                        }}
                    >
                        进入管理端
                    </Button>
                </div>
            </main>

            <section className={styles.featureSection}>
                <div className={styles.sectionTitle}>
                    <span>核心功能</span>
                </div>
                <div className={styles.featureList}>
                    {featureList.map((feature) => (
                        <div key={feature} className={styles.featureItem}>
                            {feature}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
