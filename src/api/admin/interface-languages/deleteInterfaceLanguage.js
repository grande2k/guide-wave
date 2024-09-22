import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const deleteInterfaceLanguages = async (lang) => {
    try {
        const request_params = { 
            data: { lang_code: lang },
            headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } 
        };
        await axios.delete('https://guides-to-go.onrender.com/admin/language_interface_delete', request_params);
        toast.success('Интерфейс был успешно удален');
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