import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const recoverPassword = async (params, t) => {
    try {
        const response = await axios.post('https://api.theguidewave.com/auth/accept_answer', params);
        return response.data.new_password;
    } catch (err) {
        switch (err.response.status) {
            case 400:
                toast.error(t('error_user_not_found'));
                break;
            case 405:
                toast.error(t('error_incorrect_recovery'));
                break;
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