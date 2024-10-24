import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const sendEmailForRecovery = async (params, t) => {
    try {
        const response = await axios.post('https://api.theguidewave.com/auth/forgot-password', params);
        return response.data.question;
    } catch (err) {
        switch (err.response.status) {
            case 422:
                toast.error(t('error_validation'));
                break;
            default:
                toast.error(t('error_default'));
                break;
        }
        return false;
    }
}