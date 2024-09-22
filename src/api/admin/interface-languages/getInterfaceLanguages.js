import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const getInterfaceLanguages = async (t) => {
    try {
        const response = await axios.get('https://guides-to-go.onrender.com/admin/language_interface');

        return response.data.languages;
    } catch (err) {
        switch (err.response.status) {
            case 422:
                toast.error(t('error_validation'));
            default:
                toast.error(t('error_default'));
                break;
        }

        return [];
    }
}