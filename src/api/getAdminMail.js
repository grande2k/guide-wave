import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const getAdminMail = async (t) => {
    try {
        const response = await axios.get('https://guides-to-go.onrender.com/admin/email');
        return response.data.email_admin;
    } catch (err) {
        switch (err.response.status) {
            default:
                toast.error(t('errors.default'));
                break;
        }
        return false;
    }
}