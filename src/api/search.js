import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const search = async (params, t) => {
    try {
        const response = await axios.post('https://guides-to-go.onrender.com/search', params);

        return response.data.users;
    } catch(err) {
        switch (err.response.status) {
            default:
                toast.error(t('errors.default'));
                break;
        }
    }
}