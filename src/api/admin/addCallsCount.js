import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const addCallsCount = async (params, t) => {
    try {
        const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
        const response = await axios.post('https://api.theguidewave.com/search/count', params, request_headers);

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