import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const updateAdminLanguage = async (data) => {
    try {
        data.update_lang_code = data.update_lang_code.trim().toLowerCase();

        for (const lang_code in data.languages_names) {
            const name = data.languages_names[lang_code];
            if (name) {
                data.languages_names[lang_code] = name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();
            }
        }

        const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
        const params = {
            old_lang_code: data.old_lang_code,
            update_lang_code: data.update_lang_code,
            languages_names: data.languages_names
        };

        await axios.put('https://guides-to-go.onrender.com/admin/update_languages', params, request_headers);
        toast.success('Язык был успешно обновлен');
    } catch (err) {
        if (err.response?.status === 422) {
            toast.error('Ошибка валидации');
        } else {
            toast.error('Ошибка, попробуйте позже');
        }
    }
};
