import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const deleteBackground = async (params) => {
    try {
        const request_params = {
            headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` },
            data: params 
        };
        await axios.delete('https://api.theguidewave.com/admin/background_photo_delete', request_params);
        toast.success('Фон был успешно удален');
    } catch (err) {
        switch (err.response.status) {
            default:
                toast.error('Ошибка, попробуйте позже');
                break;
        }

        return [];
    }
}