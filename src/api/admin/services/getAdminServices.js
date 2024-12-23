import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const getAdminServices = async () => {
    try {
        const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
        const response = await axios.get('https://api.theguidewave.com/admin/all_services', request_headers);

        console.log(response.data);

        return response.data;
    } catch (err) {
        switch (err.response.status) {  
            default:
                toast.error('Ошибка, попробуйте позже');
                break;
        }

        return [];
    }
}