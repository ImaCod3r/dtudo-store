import api from "../api/axios";

export async function login(token: string) {
    await api.post("/auth/google", { token });
}

export async function getUser() {
    const response = await api.get("/auth/me");
    return response.data.user;
}

export async function logoutUser() {
    await api.post("/auth/logout");
}