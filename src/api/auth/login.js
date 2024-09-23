import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const login = async (params, router, t) => {
    try {
        const response = await axios.post('https://guides-to-go.onrender.com/auth/login', params);
        const userRole = response.data.user_info[0].role_id;

        $cookies.set("access_token", response.data.access_token, "1m");
        $cookies.set("user_role", userRole, "1m");

        if (userRole === 1) {
            router.push('/profile');
        } else if (userRole === 2) {
            router.push('/admin');
        }

        toast.success(t('message_login_success'));
    } catch (err) {
        switch (err.response.status) {
            case 401:
                toast.error(t('error_login'));
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