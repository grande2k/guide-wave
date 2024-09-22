import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const getGuides = async (t) => {
    try {
        const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
        const response = await axios.get('https://guides-to-go.onrender.com/admin/guides', request_headers);

        console.log(response.data.guides);

        return response.data.guides;
    } catch (err) {
        switch (err.response.status) {
            default:
                toast.error(t('errors.default'));
                break;
        }

        return [];
    }
}