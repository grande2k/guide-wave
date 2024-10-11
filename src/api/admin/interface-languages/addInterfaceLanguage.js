import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const addInterfaceLanguage = async (data) => {
    try {
        const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
        await axios.post('https://guides-to-go.onrender.com/admin/language_interface_add', data, request_headers);
        toast.success('Интерфейс был успешно добавлен');
    } catch (err) {
        switch (err.response.status) {
            case 422:
                toast.error('Ошибка валидации');
            default:
                toast.error('Ошибка, попробуйте позже');
                break;
        }

        return [];
    }
}