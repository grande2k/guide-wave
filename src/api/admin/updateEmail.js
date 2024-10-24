import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const updateEmail = async (params, t) => {
    try {
        const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
        const response = await axios.put('https://api.theguidewave.com/admin/email', params, request_headers);

        console.log(response.data);

        return response.data;
    } catch (err) {
        switch (err.response.status) {
            default:
                toast.error(t('error_default'));
                break;
        }

        return false;
    }
}