import {
    ApiResponseDTO,
    AuthenticationErrorDTO,
    ContactDTO,
    ErrorResponseDTO,
    FriendRequestDTO,
    LoginRequestDTO,
    LoginResponseDTO,
    SignUpRequestDTO,
    UpdateUserRequestDTO,
    UserDTO,
    UserPresenceDTO
} from "./AuthModel";
import * as actionTypes from "./AuthActionType";
import {BASE_API_URL, TOKEN} from "../../config/Config";
import {AUTHORIZATION_PREFIX} from "../Constants";
import {AppDispatch} from "../Store";

const AUTH_PATH = "auth";
const USER_PATH = "api/users";

const getErrorMessage = async (res: Response, fallback: string): Promise<string> => {
    try {
        const data: ErrorResponseDTO | AuthenticationErrorDTO = await res.json();
        return "error" in data ? (data.message || data.error || fallback) : (data.message || fallback);
    } catch {
        return fallback;
    }
};

const authHeaders = (token: string) => ({
    "Content-Type": "application/json",
    Authorization: `${AUTHORIZATION_PREFIX}${token}`,
});

export const clearAuthFeedback = () => ({type: actionTypes.CLEAR_AUTH_FEEDBACK, payload: null});

export const register = (data: SignUpRequestDTO) => async (dispatch: AppDispatch): Promise<boolean> => {
    try {
        const res = await fetch(`${BASE_API_URL}/${AUTH_PATH}/signup`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const message = await getErrorMessage(res, "注册失败，请稍后重试");
            dispatch({type: actionTypes.AUTH_ERROR, payload: message});
            return false;
        }

        const resData: LoginResponseDTO = await res.json();
        if (resData.token) {
            localStorage.setItem(TOKEN, resData.token);
        }
        dispatch({type: actionTypes.REGISTER, payload: resData});
        dispatch({type: actionTypes.AUTH_SUCCESS, payload: "注册成功，欢迎使用翼家校园通信系统"});
        return true;
    } catch (error) {
        console.error("Register failed:", error);
        dispatch({type: actionTypes.AUTH_ERROR, payload: "注册失败，请检查后端是否启动"});
        return false;
    }
};

export const loginUser = (data: LoginRequestDTO) => async (dispatch: AppDispatch): Promise<boolean> => {
    try {
        const res = await fetch(`${BASE_API_URL}/${AUTH_PATH}/signin`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({account: data.account, password: data.password}),
        });

        if (!res.ok) {
            const message = await getErrorMessage(res, "登录失败，请检查账号或密码");
            dispatch({type: actionTypes.AUTH_ERROR, payload: message});
            return false;
        }

        const resData: LoginResponseDTO = await res.json();
        if (resData.token) {
            localStorage.setItem(TOKEN, resData.token);
        }
        dispatch({type: actionTypes.LOGIN_USER, payload: resData});
        dispatch({type: actionTypes.AUTH_SUCCESS, payload: "登录成功，正在进入翼家校园通信系统"});
        return true;
    } catch (error) {
        console.error("Login failed:", error);
        dispatch({type: actionTypes.AUTH_ERROR, payload: "登录失败，请检查网络或后端状态"});
        return false;
    }
};

export const currentUser = (token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        const res = await fetch(`${BASE_API_URL}/${USER_PATH}/profile`, {
            method: "GET",
            headers: authHeaders(token),
        });

        const resData: UserDTO | AuthenticationErrorDTO = await res.json();
        if ("message" in resData && resData.message === "Authentication Error") {
            localStorage.removeItem(TOKEN);
            return;
        }
        dispatch({type: actionTypes.REQ_USER, payload: resData});
    } catch (error) {
        console.error("Fetching current user failed:", error);
    }
};

export const searchUser = (query: string, token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        const res = await fetch(`${BASE_API_URL}/${USER_PATH}/${encodeURIComponent(query)}`, {
            method: "GET",
            headers: authHeaders(token),
        });

        const resData: UserDTO[] = await res.json();
        dispatch({type: actionTypes.SEARCH_USER, payload: resData});
    } catch (error) {
        console.error("Searching user failed:", error);
    }
};

export const getAllUsers = (token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        const res = await fetch(`${BASE_API_URL}/${USER_PATH}`, {
            method: "GET",
            headers: authHeaders(token),
        });

        const resData: UserPresenceDTO[] = await res.json();
        dispatch({type: actionTypes.GET_ALL_USERS, payload: resData});
    } catch (error) {
        console.error("Fetching users failed:", error);
    }
};

export const getContacts = (token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        const res = await fetch(`${BASE_API_URL}/${USER_PATH}/contacts`, {
            method: "GET",
            headers: authHeaders(token),
        });
        const resData: ContactDTO[] = await res.json();
        dispatch({type: actionTypes.GET_CONTACTS, payload: resData});
    } catch (error) {
        console.error("Fetching contacts failed:", error);
    }
};

export const getIncomingFriendRequests = (token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        const res = await fetch(`${BASE_API_URL}/${USER_PATH}/friend-requests/incoming`, {
            method: "GET",
            headers: authHeaders(token),
        });
        const resData: FriendRequestDTO[] = await res.json();
        dispatch({type: actionTypes.GET_INCOMING_FRIEND_REQUESTS, payload: resData});
    } catch (error) {
        console.error("Fetching incoming friend requests failed:", error);
    }
};

export const getOutgoingFriendRequests = (token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        const res = await fetch(`${BASE_API_URL}/${USER_PATH}/friend-requests/outgoing`, {
            method: "GET",
            headers: authHeaders(token),
        });
        const resData: FriendRequestDTO[] = await res.json();
        dispatch({type: actionTypes.GET_OUTGOING_FRIEND_REQUESTS, payload: resData});
    } catch (error) {
        console.error("Fetching outgoing friend requests failed:", error);
    }
};

export const addFriend = (friendId: string, remarkName: string, token: string) => async (
    dispatch: AppDispatch
): Promise<boolean> => {
    try {
        const res = await fetch(`${BASE_API_URL}/${USER_PATH}/contacts`, {
            method: "POST",
            headers: authHeaders(token),
            body: JSON.stringify({friendId, remarkName}),
        });

        if (!res.ok) {
            const message = await getErrorMessage(res, "好友申请发送失败");
            dispatch({type: actionTypes.AUTH_ERROR, payload: message});
            return false;
        }

        dispatch({type: actionTypes.AUTH_SUCCESS, payload: "好友申请已发送"});
        await Promise.all([
            dispatch(getOutgoingFriendRequests(token)),
            dispatch(getIncomingFriendRequests(token)),
        ]);
        return true;
    } catch (error) {
        console.error("Add friend failed:", error);
        dispatch({type: actionTypes.AUTH_ERROR, payload: "好友申请发送失败，请稍后重试"});
        return false;
    }
};

export const approveFriendRequest = (requestId: string, token: string) => async (
    dispatch: AppDispatch
): Promise<boolean> => {
    try {
        const res = await fetch(`${BASE_API_URL}/${USER_PATH}/friend-requests/${requestId}/approve`, {
            method: "POST",
            headers: authHeaders(token),
        });

        if (!res.ok) {
            const message = await getErrorMessage(res, "通过好友申请失败");
            dispatch({type: actionTypes.AUTH_ERROR, payload: message});
            return false;
        }

        dispatch({type: actionTypes.AUTH_SUCCESS, payload: "好友申请已通过"});
        await Promise.all([
            dispatch(getContacts(token)),
            dispatch(getIncomingFriendRequests(token)),
            dispatch(getOutgoingFriendRequests(token)),
        ]);
        return true;
    } catch (error) {
        console.error("Approve friend request failed:", error);
        dispatch({type: actionTypes.AUTH_ERROR, payload: "通过好友申请失败，请稍后重试"});
        return false;
    }
};

export const rejectFriendRequest = (requestId: string, token: string) => async (
    dispatch: AppDispatch
): Promise<boolean> => {
    try {
        const res = await fetch(`${BASE_API_URL}/${USER_PATH}/friend-requests/${requestId}/reject`, {
            method: "POST",
            headers: authHeaders(token),
        });

        if (!res.ok) {
            const message = await getErrorMessage(res, "拒绝好友申请失败");
            dispatch({type: actionTypes.AUTH_ERROR, payload: message});
            return false;
        }

        dispatch({type: actionTypes.AUTH_SUCCESS, payload: "好友申请已拒绝"});
        await Promise.all([
            dispatch(getIncomingFriendRequests(token)),
            dispatch(getOutgoingFriendRequests(token)),
        ]);
        return true;
    } catch (error) {
        console.error("Reject friend request failed:", error);
        dispatch({type: actionTypes.AUTH_ERROR, payload: "拒绝好友申请失败，请稍后重试"});
        return false;
    }
};

export const updateRemark = (friendId: string, remarkName: string, token: string) => async (
    dispatch: AppDispatch
): Promise<boolean> => {
    try {
        const res = await fetch(`${BASE_API_URL}/${USER_PATH}/contacts/${friendId}/remark`, {
            method: "PUT",
            headers: authHeaders(token),
            body: JSON.stringify({remarkName}),
        });

        if (!res.ok) {
            const message = await getErrorMessage(res, "备注更新失败");
            dispatch({type: actionTypes.AUTH_ERROR, payload: message});
            return false;
        }

        dispatch({type: actionTypes.AUTH_SUCCESS, payload: "好友备注已更新"});
        await dispatch(getContacts(token));
        return true;
    } catch (error) {
        console.error("Update remark failed:", error);
        dispatch({type: actionTypes.AUTH_ERROR, payload: "备注更新失败，请稍后重试"});
        return false;
    }
};

export const updateUser = (data: UpdateUserRequestDTO, token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        const res = await fetch(`${BASE_API_URL}/${USER_PATH}/update`, {
            method: "PUT",
            headers: authHeaders(token),
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const message = await getErrorMessage(res, "资料更新失败");
            dispatch({type: actionTypes.AUTH_ERROR, payload: message});
            return;
        }

        const resData: ApiResponseDTO = await res.json();
        dispatch({type: actionTypes.UPDATE_USER, payload: resData});
        dispatch({type: actionTypes.AUTH_SUCCESS, payload: "个人资料已保存"});
    } catch (error) {
        console.error("User update failed:", error);
        dispatch({type: actionTypes.AUTH_ERROR, payload: "资料更新失败，请稍后重试"});
    }
};

export const logoutUser = () => async (dispatch: AppDispatch): Promise<void> => {
    const token = localStorage.getItem(TOKEN);
    if (token) {
        try {
            await fetch(`${BASE_API_URL}/${AUTH_PATH}/signout`, {
                method: "POST",
                headers: authHeaders(token),
            });
        } catch (error) {
            console.error("Logout sync failed:", error);
        }
    }
    localStorage.removeItem(TOKEN);
    dispatch({type: actionTypes.LOGOUT_USER, payload: null});
    dispatch({type: actionTypes.REQ_USER, payload: null});
    dispatch({type: actionTypes.AUTH_SUCCESS, payload: "已安全退出翼家校园通信系统"});
};

