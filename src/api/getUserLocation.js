import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const getUserLocation = async (t) => {
    try {
        const response = await axios.get('http://ip-api.com/json');
        return response.data;
    } catch (err) {
        switch (err.response.status) {
            default:
                toast.error(t('error_default'));
                break;
        }

        return [];
    }
}