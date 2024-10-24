import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const getCities = async (country_id, t, lang) => {
    try {
        const locale = localStorage.getItem('language') || 'en';
        const params = { language: lang ?? locale, country_id: country_id };
        const response = await axios.post('https://api.theguidewave.com/search/get_city', params);
        
        return response.data.cities;
    } catch (err) {
        switch (err.response.status) {
            case 422:
                toast.error(t('error_validation'));
            default:
                toast.error(t('error_default'));
                break;
        }

        return [];
    }
}