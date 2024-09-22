import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const updateInterfaceLanguage = async (data) => {
    try {
        data.new_lang_code = data.new_lang_code.trim().toLowerCase();
        data.new_lang_name = data.new_lang_name.trim();
        data.new_lang_name = data.new_lang_name.charAt(0).toUpperCase() + data.new_lang_name.slice(1).toLowerCase();

        const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
        const params = {
            old_lang_code: data.old_lang_code,
            update_lang_code: data.new_lang_code,
            languages_name: data.new_lang_name
        };
        
        await axios.put('https://guides-to-go.onrender.com/admin/language_interface_update', params, request_headers);
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