import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const getAdminMail = async (t) => {
    try {
        const response = await axios.get('https://api.theguidewave.com/admin/email');
        return response.data.email_admin;
    } catch (err) {
        switch (err.response.status) {
            default:
                toast.error(t('error_default'));
                break;
        }
        return false;
    }
}