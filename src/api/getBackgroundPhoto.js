import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const getBackgroundPhoto = async (code, t) => {
    try {
        const response = await axios.post('https://guides-to-go.onrender.com/admin/background_photo', { country_code: code });
        return response.data.photo_url;
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