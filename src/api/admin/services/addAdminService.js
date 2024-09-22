import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const addAdminService = async (params) => {
    try {
        const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
        await axios.post('https://guides-to-go.onrender.com/admin/add_services', params, request_headers);
        toast.success('Услуга была добавлена успешно');
    } catch(err) {
        switch (err.response.status) {
            case 422:
                toast.error('Ошибка валидации');
                break;
            default:
                toast.error('Ошибка, попробуйте позже');
                break;
        }
    }
}