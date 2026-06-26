import React, {Dispatch, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {
    Alert,
    Button,
    Chip,
    Divider,
    InputAdornment,
    Snackbar,
    TextField
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import {TOKEN} from "../../config/Config";
import {AuthReducerState, LoginRequestDTO} from "../../redux/auth/AuthModel";
import {clearAuthFeedback, currentUser, loginUser} from "../../redux/auth/AuthAction";
import {RootState} from "../../redux/Store";
import styles from "./Register.module.scss";
import yijiaLogo from "../../assets/yijia-logo.png";

const demoAccounts: {label: string; account: string; password: string}[] = [
    {label: "林妍", account: "lin.yan@yijia.cn", password: "123456"},
    {label: "周晨", account: "zhou.chen@yijia.cn", password: "123456"}
];

const SignIn = () => {
    const [signInData, setSignInData] = useState<LoginRequestDTO>({account: "", password: ""});
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const dispatch: Dispatch<any> = useDispatch();
    const navigate = useNavigate();
    const token = localStorage.getItem(TOKEN);
    const state: AuthReducerState = useSelector((root: RootState) => root.auth);

    const accountError = Boolean(
        state.errorMessage &&
        /(账号|邮箱|手机号|校园号|登录凭证|请输入)/.test(state.errorMessage)
    );
    const passwordError = Boolean(state.errorMessage && /密码/.test(state.errorMessage));

    useEffect(() => {
        document.title = "翼家校园通信系统";
    }, []);

    useEffect(() => {
        if (token && !state.reqUser) {
            dispatch(currentUser(token));
        }
    }, [token, state.reqUser, dispatch]);

    useEffect(() => {
        if (state.successMessage || state.errorMessage) {
            setSnackbarOpen(true);
        }
    }, [state.successMessage, state.errorMessage]);

    useEffect(() => {
        if (state.reqUser) {
            navigate("/app");
        }
    }, [state.reqUser, navigate]);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await dispatch(loginUser(signInData));
        const savedToken = localStorage.getItem(TOKEN);
        if (savedToken) {
            dispatch(currentUser(savedToken));
        }
    };

    const onLoginDemoAccount = async (account: string, password: string) => {
        const demoData: LoginRequestDTO = {account, password};
        setSignInData(demoData);
        await dispatch(loginUser(demoData));
        const savedToken = localStorage.getItem(TOKEN);
        if (savedToken) {
            dispatch(currentUser(savedToken));
        }
    };

    const onCloseSnackbar = () => {
        setSnackbarOpen(false);
        dispatch(clearAuthFeedback());
    };

    const feedbackMessage = state.errorMessage || state.successMessage;
    const feedbackSeverity = state.errorMessage ? "error" : "success";

    return (
        <div className={styles.page}>
            <section className={styles.aside}>
                <div className={styles.asideGlow}/>
                <div className={styles.asideTop}>
                    <div className={styles.logoStage}>
                        <img src={yijiaLogo} alt="翼家校园通信系统 Logo" className={styles.logo}/>
                        <span className={styles.logoRing}/>
                        <span className={styles.logoDot}/>
                    </div>
                    <div className={styles.brandBlock}>
                        <p className={styles.brandSub}>校园即时通信与文件传输平台</p>
                        <h1 className={styles.brandTitle}>翼家校园通信系统</h1>
                    </div>
                </div>

                <div className={styles.asideBody}>
                    <p className={styles.brandKicker}>用户登录</p>
                    <h2>轻松连接同学、群组与校园消息</h2>
                    <p className={styles.brandCopy}>
                        登录后即可进入聊天主界面，进行单聊、群聊、好友申请处理、在线状态查看、
                        消息已读确认与文件传输。
                    </p>

                    <div className={styles.featureRow}>
                        <span>在线状态</span>
                        <span>好友申请</span>
                        <span>消息已读</span>
                        <span>文件传输</span>
                    </div>
                </div>

                <div className={styles.asideFooter}>
                    <div className={styles.miniStat}>
                        <strong>蓝绿新主题</strong>
                        <span>更清爽的校园沟通界面</span>
                    </div>
                    <div className={styles.miniStat}>
                        <strong>多种登录方式</strong>
                        <span>支持邮箱、手机号与校园号</span>
                    </div>
                </div>
            </section>

            <section className={styles.panel}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div>
                            <p className={styles.cardEyebrow}>欢迎回来</p>
                            <h2>登录翼家校园通信系统</h2>
                            <p>输入账号与密码，继续你的校园沟通。</p>
                        </div>
                        <Chip label="用户入口" color="success" variant="outlined"/>
                    </div>

                    <div className={styles.demoLogin}>
                        <div className={styles.demoTitleRow}>
                            <p className={styles.demoHint}>演示账号</p>
                            <span>点击即可快速登录</span>
                        </div>
                        <div className={styles.demoActions}>
                            {demoAccounts.map((account) => (
                                <Button
                                    key={account.account}
                                    variant="outlined"
                                    onClick={() => onLoginDemoAccount(account.account, account.password)}
                                    className={styles.demoButton}
                                >
                                    {account.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {feedbackMessage ? (
                        <Alert severity={feedbackSeverity} variant="filled" className={styles.feedback}>
                            {feedbackMessage}
                        </Alert>
                    ) : null}

                    <form onSubmit={onSubmit} className={styles.form}>
                        <TextField
                            id="account"
                            type="text"
                            label="账号"
                            placeholder="邮箱 / 手机号 / 校园号"
                            variant="outlined"
                            autoComplete="username"
                            onChange={(e) => setSignInData({...signInData, account: e.target.value})}
                            value={signInData.account}
                            error={accountError}
                            helperText={accountError ? state.errorMessage : "支持邮箱、手机号和校园号登录"}
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AccountCircleRoundedIcon/>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <TextField
                            id="password"
                            type="password"
                            label="密码"
                            placeholder="请输入密码"
                            variant="outlined"
                            autoComplete="current-password"
                            onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                            value={signInData.password}
                            error={passwordError}
                            helperText={passwordError ? state.errorMessage : "密码错误时会显示明确提示"}
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockRoundedIcon/>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            type="submit"
                            className={styles.submitButton}
                            endIcon={<ArrowForwardRoundedIcon/>}
                        >
                            登录进入翼家校园通信系统
                        </Button>
                    </form>

                    <Divider className={styles.divider}>还没有账号</Divider>

                    <div className={styles.bottomContainer}>
                        <Button variant="text" size="large" onClick={() => navigate("/signup")}>
                            去注册
                        </Button>
                        <Button variant="text" size="large" onClick={() => navigate("/admin/signin")}>
                            管理员入口
                        </Button>
                    </div>

                    <div className={styles.backHome}>
                        <Button variant="text" onClick={() => navigate("/")}>返回首页</Button>
                    </div>
                </div>
            </section>

            <Snackbar open={snackbarOpen} autoHideDuration={2600} onClose={onCloseSnackbar}>
                <Alert onClose={onCloseSnackbar} severity={state.errorMessage ? "error" : "success"} variant="filled">
                    {feedbackMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default SignIn;
