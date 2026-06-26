import {BASE_API_URL} from "../../config/Config";
import {AUTHORIZATION_PREFIX} from "../../redux/Constants";
import {
    AdminBroadcastRequestDTO,
    AdminBroadcastResultDTO,
    AdminDashboardSummaryDTO,
    AdminOnlineUserDTO
} from "./AdminModel";

const ADMIN_PATH = "api/admin";

export const adminLogin = async (email: string, password: string): Promise<string> => {
    const res = await fetch(`${BASE_API_URL}/auth/admin/signin`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({account: email, password})
    });

    if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || data?.error || "管理员登录失败");
    }

    const data = await res.json();
    return data.token;
};

export const getAdminSummary = async (token: string): Promise<AdminDashboardSummaryDTO> => {
    const res = await fetch(`${BASE_API_URL}/${ADMIN_PATH}/summary`, {
        headers: {Authorization: `${AUTHORIZATION_PREFIX}${token}`}
    });
    if (!res.ok) {
        throw new Error("获取服务端概览失败");
    }
    return res.json();
};

export const getAdminUsers = async (token: string): Promise<AdminOnlineUserDTO[]> => {
    const res = await fetch(`${BASE_API_URL}/${ADMIN_PATH}/users`, {
        headers: {Authorization: `${AUTHORIZATION_PREFIX}${token}`}
    });
    if (!res.ok) {
        throw new Error("获取在线用户列表失败");
    }
    return res.json();
};

export const postAdminBroadcast = async (
    token: string,
    payload: AdminBroadcastRequestDTO
): Promise<AdminBroadcastResultDTO> => {
    const res = await fetch(`${BASE_API_URL}/${ADMIN_PATH}/broadcast`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `${AUTHORIZATION_PREFIX}${token}`
        },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        throw new Error("发送广播失败");
    }
    return res.json();
};
