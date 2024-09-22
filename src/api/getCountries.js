import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const getCountries = async (t) => {
    try {
        const locale = localStorage.getItem('language') || 'en';
        const params = { language: locale };
        const response = await axios.post('https://guides-to-go.onrender.com/search/get_country', params);
        
        return response.data.countries;
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