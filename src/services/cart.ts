import api from "../api/axios";

export interface CartResponse {
    error: boolean;
    message: string;
    cart_item: {
        id: number;
        cart_id: number;
        quantity: number;
        product: {
            id: string;
            name: string;
            price: number;
            description: string;
            category: string;
            public_id: string;
            image_url: string;
        };
    };
}

export async function getCart(user_id: string) {
    const response = await api.get('/carts/user/cart', {
        params: {
            user_id
        }
    });
    return response.data;
}

export async function add(user_id: string, product_id: string, quantity: number = 1): Promise<CartResponse> {
    const response = await api.post('/carts/add', {
        user_id,
        product_id,
        quantity
    });
    return response.data;
}

export async function update(user_id: string, item_id: string, quantity: number) {
    const response = await api.put(`/carts/update/${item_id}`, {
        user_id,
        quantity
    });
    return response.data;
}

export async function remove(user_id: string, item_id: string) {
    const response = await api.delete(`/carts/remove/${item_id}`, {
        data: {
            user_id
        }
    });
    return response.data;
}