import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const getLocations = async (t) => {
    try {
        const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
        const response = await axios.get('https://api.theguidewave.com/admin/country_and_city', request_headers);
        console.log(response.data);
        return response.data.data;
    } catch (err) {
        switch (err.response.status) {
            default:
                toast.error(t('error_default'));
                break;
        }

        return [];
    }
}