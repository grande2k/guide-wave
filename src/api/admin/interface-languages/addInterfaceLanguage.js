import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const addInterfaceLanguage = async (data) => {
    try {
        data.lang_code = data.lang_code.trim().toLowerCase();
        data.name = data.name.trim();
        data.name = data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase();

        const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
        const params = { lang_code: data.lang_code, languages_name: data.name };
        
        await axios.post('https://guides-to-go.onrender.com/admin/language_interface_add', params, request_headers);
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