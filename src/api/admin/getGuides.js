import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const getGuides = async (router, t) => {
    try {
        const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
        const response = await axios.get('https://guides-to-go.onrender.com/admin/guides', request_headers);

        console.log(response.data.guides);

        return response.data.guides;
    } catch (err) {
        switch (err.response.status) {
            case 401:
                $cookies.remove("access_token");
                $cookies.remove("user_role");
                router.push('/login');
                break;
            default:
                toast.error(t('errors.default'));
                break;
        }

        return [];
    }
}