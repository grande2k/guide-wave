import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const deleteAdminService = async (params) => {
    try {
        const request_params = {
            headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` },
            data: params 
        };
        await axios.delete('https://api.theguidewave.com/admin/delete_service', request_params);
        toast.success('Услуга была успешно удалена');
    } catch (err) {
        switch (err.response.status) {
            default:
                toast.error('Ошибка, попробуйте позже');
                break;
        }

        return [];
    }
}