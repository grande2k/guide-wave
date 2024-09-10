import axios from "axios";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";

const toast = useToast();
const router = useRouter();

export const getProfile = async (t) => {
    try {
        const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
        const response = await axios.get('https://guides-to-go.onrender.com/user_info', request_headers);

        return response.data.info_about_user;
    } catch (err) {
        switch (err.response.status) {
            case 401:
                $cookies.remove("access_token");
                router.push('/login');
                break;
            default:
                toast.error(t('errors.default'));
                break;
        }

        return null;
    }
}