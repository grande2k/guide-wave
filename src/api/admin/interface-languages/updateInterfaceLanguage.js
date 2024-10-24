import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const updateInterfaceLanguage = async (data) => {
    try {
        const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
        await axios.put('https://api.theguidewave.com/admin/language_interface_update', data, request_headers);
        toast.success('Интерфейс был успешно обновлен');
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