import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const getCities = async (country_id, t, lang) => {
    try {
        const locale = localStorage.getItem('language') || 'en';
        const params = { language: lang ?? locale, country_id: country_id };
        const response = await axios.post('https://guides-to-go.onrender.com/search/get_city', params);
        
        return response.data.cities;
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