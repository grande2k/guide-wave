import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const deleteLanguage = async (params, t) => {
    try {
        const request_headers = {
            headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` },
            //withCredentials: true,
            data: params 
        };

        const response = await axios.delete('https://guides-to-go.onrender.com/admin/delete_languages', request_headers);

        console.log(response.data);

        return response.data;
    } catch (err) {
        switch (err.response.status) {
            default:
                toast.error(t('errors.default'));
                break;
        }

        return [];
    }
}