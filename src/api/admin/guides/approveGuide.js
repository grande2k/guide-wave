import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const approveGuide = async (params, t) => {
    try {
        const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
        const response = await axios.post('https://guides-to-go.onrender.com/admin/approve_guide', params, request_headers);

        console.log(response.data);

        return response.data;
    } catch(err) {
        switch (err.response.status) {
            case 422:
                toast.error(t('error_validation'));
                break;
            default:
                toast.error(t('error_default'));
                break;
        }
    }
}