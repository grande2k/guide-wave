import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const getRecoveryQuestions = async (t) => {
    try {
        const locale = localStorage.getItem('language') || 'en';
        const params = { language_code: locale };
        const response = await axios.post('https://api.theguidewave.com/auth/list_questions', params);
        return response.data.questions;
    } catch (err) {
        switch (err.response.status) {
            default:
                toast.error(t('error_default'));
                break;
        }
        return false;
    }
}