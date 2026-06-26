import ForumIcon from "@mui/icons-material/Forum";
import React from "react";
import {UserDTO} from "../../redux/auth/AuthModel";
import styles from "./WelcomePage.module.scss";

interface WelcomePageProps {
    reqUser: UserDTO | null;
}

const WelcomePage = (props: WelcomePageProps) => {
    return (
        <div className={styles.welcomeContainer}>
            <div className={styles.innerWelcomeContainer}>
                <ForumIcon
                    sx={{
                        width: "10rem",
                        height: "10rem",
                    }}
                />
                <h1>欢迎回来，{props.reqUser?.fullName}</h1>
                <p>从左侧会话列表或右侧联系人面板选择对象，开始在翼家校园通信系统中聊天。</p>
            </div>
        </div>
    );
};

export default WelcomePage;
