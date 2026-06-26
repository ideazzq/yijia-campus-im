import React, {Dispatch, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../redux/Store";
import {AuthReducerState, UpdateUserRequestDTO} from "../../redux/auth/AuthModel";
import {TOKEN} from "../../config/Config";
import {currentUser, updateUser} from "../../redux/auth/AuthAction";
import WestIcon from '@mui/icons-material/West';
import {Avatar, Button, IconButton, TextField} from "@mui/material";
import styles from './Profile.module.scss';

interface ProfileProps {
    onCloseProfile: () => void;
    initials: string;
}

const Profile = (props: ProfileProps) => {

    const [fullName, setFullName] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const dispatch: Dispatch<any> = useDispatch();
    const auth: AuthReducerState = useSelector((state: RootState) => state.auth);
    const token: string | null = localStorage.getItem(TOKEN);

    useEffect(() => {
        if (auth.reqUser) {
            setFullName(auth.reqUser.fullName);
            setPhoneNumber(auth.reqUser.phoneNumber);
        }
    }, [auth.reqUser]);

    useEffect(() => {
        if (token && auth.updateUser) {
            dispatch(currentUser(token));
        }
    }, [auth.updateUser, token, dispatch]);

    const onUpdateUser = () => {
        if (token) {
            const data: UpdateUserRequestDTO = {
                fullName,
                phoneNumber,
            };
            dispatch(updateUser(data, token));
        }
    };

    return (
        <div className={styles.outerContainer}>
            <div className={styles.headingContainer}>
                <IconButton onClick={props.onCloseProfile}>
                    <WestIcon fontSize='medium'/>
                </IconButton>
                <h2>个人资料</h2>
            </div>
            <div className={styles.avatarContainer}>
                <Avatar sx={{width: '8rem', height: '8rem', fontSize: '2.6rem'}}>{props.initials}</Avatar>
            </div>
            <div className={styles.formArea}>
                <TextField
                    fullWidth
                    label="姓名"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />
                <TextField
                    fullWidth
                    label="手机号"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <TextField
                    fullWidth
                    label="邮箱"
                    value={auth.reqUser?.email || ""}
                    disabled
                />
                <TextField
                    fullWidth
                    label="校园号"
                    value={auth.reqUser?.yijiaId || ""}
                    disabled
                />
                <Button variant="contained" onClick={onUpdateUser}>保存资料</Button>
            </div>
            <div className={styles.infoContainer}>
                <p className={styles.infoText}>校园号由系统自动生成，手机号可用于好友搜索。</p>
            </div>
        </div>
    );
};

export default Profile;

