import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const getProfile = async (router, t) => {
    try {
        const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
        const response = await axios.get('https://api.theguidewave.com/user_info/', request_headers);

        console.log(response.data.info_about_user);

        return response.data.info_about_user;
    } catch (err) {
        switch (err.response.status) {
            case 401:
                $cookies.remove("access_token");
                $cookies.remove("user_role");
                router.push('/login');
                break;
            default:
                toast.error(t('error_default'));
                break;
        }

        return null;
    }
}