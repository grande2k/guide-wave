import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const addCalendar = async (params, t) => {
    try {
        const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
        await axios.post('https://guides-to-go.onrender.com/user_info/add_calendar', params, request_headers);
    } catch(err) {
        switch (err.response.status) {
            default:
                toast.error(t('error_default'));
                break;
        }
    }
}