import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const updateInterface = async (params) => {
    try {
        const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
        await axios.put('https://guides-to-go.onrender.com/admin/update_interface', params, request_headers);
        toast.success('Успешно');
    } catch (err) {
        switch (err.response.status) {
            default:
                toast.error('Ошибка, попробуйте позже');
                break;
        }

        return [];
    }
}