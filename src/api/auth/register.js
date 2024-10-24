import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const register = async (params, router, t) => {
    try {
        await axios.post('https://api.theguidewave.com/auth/register', params);
        router.push('/login');
        toast.success(t('message_register_success'));
    } catch (err) {
        switch (err.response.status) {
            case 400:
                toast.error( t('error_already_exists') );
                break;
            case 422:
                toast.error( t('error_validation') );
                break;
            default:
                toast.error( t('error_default') );
                break;
        }
        
        return false;
    }
}