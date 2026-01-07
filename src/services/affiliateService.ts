import api from "../api/axios";
import type { Affiliate, ApiResponse, WithdrawalRequest } from "../types";

export const affiliateService = {
    getMe: async (): Promise<ApiResponse<Affiliate>> => {
        const response = await api.get("/affiliates/me");
        return response.data;
    },

    apply: async (formData: FormData): Promise<ApiResponse> => {
        const response = await api.post("/affiliates/apply", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    withdraw: async (data: WithdrawalRequest): Promise<ApiResponse> => {
        const response = await api.post("/affiliates/withdraw", data);
        return response.data;
    }
};

export default affiliateService;