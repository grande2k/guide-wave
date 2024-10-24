import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const addAdminLanguage = async (data) => {
    try {
        data.lang_code = data.lang_code.trim().toLowerCase();

        for (const lang_code in data.languages_names) {
            const name = data.languages_names[lang_code];
            if (name) {
                data.languages_names[lang_code] = name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();
            }
        }

        const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
        const params = {
            lang_code: data.lang_code,
            languages_names: data.languages_names
        };

        await axios.post('https://api.theguidewave.com/admin/add_languages', params, request_headers);
        toast.success('Язык был успешно добавлен');
    } catch (err) {
        if (err.response?.status === 422) {
            toast.error('Ошибка валидации');
        } else {
            toast.error('Ошибка, попробуйте позже');
        }
    }
}