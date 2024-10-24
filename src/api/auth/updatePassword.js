import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const updatePassword = async (params, t) => {
    try {
        const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
        await axios.put('https://api.theguidewave.com/auth/update_password', params, request_headers);
        toast.success(t('message_password_updated_success'));
    } catch(err) {
        switch (err.response.status) {
            case 400:
                toast.error(t('error_wrong_password'));
                break;
            case 422:
                toast.error(t('error_validation'));
                break;
            default:
                toast.error(t('error_default'));
                break;
        }
    }
}