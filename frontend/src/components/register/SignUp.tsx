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
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LocalPhoneRoundedIcon from "@mui/icons-material/LocalPhoneRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import {TOKEN} from "../../config/Config";
import {RootState} from "../../redux/Store";
import {AuthReducerState, SignUpRequestDTO} from "../../redux/auth/AuthModel";
import {clearAuthFeedback, currentUser, register} from "../../redux/auth/AuthAction";
import styles from "./Register.module.scss";
import yijiaLogo from "../../assets/yijia-logo.png";

const SignUp = () => {
    const [createAccountData, setCreateAccountData] = useState<SignUpRequestDTO>({
        fullName: "",
        email: "",
        phoneNumber: "",
        password: ""
    });
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const dispatch: Dispatch<any> = useDispatch();
    const navigate = useNavigate();
    const token = localStorage.getItem(TOKEN);
    const state: AuthReducerState = useSelector((root: RootState) => root.auth);

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
        await dispatch(register(createAccountData));
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
                    <p className={styles.brandKicker}>用户注册</p>
                    <h2>创建你的校园沟通账号</h2>
                    <p className={styles.brandCopy}>
                        注册完成后，系统会为你分配专属校园号，方便同学通过手机号、邮箱或校园号搜索到你，
                        并立即开始聊天、加好友和文件传输。
                    </p>

                    <div className={styles.featureRow}>
                        <span>自动生成校园号</span>
                        <span>支持好友申请</span>
                        <span>支持备注昵称</span>
                        <span>注册后直接可用</span>
                    </div>
                </div>

                <div className={styles.asideFooter}>
                    <div className={styles.miniStat}>
                        <strong>本地化保存</strong>
                        <span>用户与消息数据本地持久化</span>
                    </div>
                    <div className={styles.miniStat}>
                        <strong>注册即登录</strong>
                        <span>完成后自动进入系统主页</span>
                    </div>
                </div>
            </section>

            <section className={styles.panel}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div>
                            <p className={styles.cardEyebrow}>开启你的账号</p>
                            <h2>注册翼家校园通信系统</h2>
                            <p>填写基础资料后即可创建账户。</p>
                        </div>
                        <Chip label="自动登录" color="success" variant="outlined"/>
                    </div>

                    {feedbackMessage ? (
                        <Alert severity={state.errorMessage ? "error" : "success"} variant="filled" className={styles.feedback}>
                            {feedbackMessage}
                        </Alert>
                    ) : null}

                    <form onSubmit={onSubmit} className={styles.form}>
                        <TextField
                            id="fullName"
                            type="text"
                            label="姓名"
                            placeholder="请输入姓名"
                            variant="outlined"
                            autoComplete="name"
                            onChange={(e) => setCreateAccountData({...createAccountData, fullName: e.target.value})}
                            value={createAccountData.fullName}
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonRoundedIcon/>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <TextField
                            id="phoneNumber"
                            type="tel"
                            label="手机号"
                            placeholder="请输入 11 位手机号"
                            variant="outlined"
                            autoComplete="tel"
                            onChange={(e) => setCreateAccountData({...createAccountData, phoneNumber: e.target.value})}
                            value={createAccountData.phoneNumber}
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LocalPhoneRoundedIcon/>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <TextField
                            id="email"
                            type="email"
                            label="邮箱"
                            placeholder="请输入邮箱"
                            variant="outlined"
                            autoComplete="email"
                            onChange={(e) => setCreateAccountData({...createAccountData, email: e.target.value})}
                            value={createAccountData.email}
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailRoundedIcon/>
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
                            autoComplete="new-password"
                            onChange={(e) => setCreateAccountData({...createAccountData, password: e.target.value})}
                            value={createAccountData.password}
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
                            注册并进入翼家校园通信系统
                        </Button>
                    </form>

                    <Divider className={styles.divider}>已经有账号</Divider>

                    <div className={styles.bottomContainer}>
                        <Button variant="text" size="large" onClick={() => navigate("/signin")}>
                            去登录
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

export default SignUp;
