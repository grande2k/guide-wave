import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();
const locale = localStorage.getItem('language') || 'en';

export const getLanguages = async (t) => {
    try {
        const params = { language: locale };
        const response = await axios.post('https://guides-to-go.onrender.com/search/language', params);

        return response.data.language;
    } catch (err) {
        switch (err.response.status) {
            case 422:
                toast.error(t('errors.validation'));
            default:
                toast.error(t('errors.default'));
                break;
        }

        return [];
    }
}