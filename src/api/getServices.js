import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const getServices = async (source, t) => {
    if(source === 'tourist') {
        try {
            const locale = localStorage.getItem('language') || 'en';
            const params = { language: locale };
            const response = await axios.post('https://guides-to-go.onrender.com/search/services', params);

            console.log(response.data.services);

            return response.data.services;
        } catch (err) {
            switch (err.response.status) {
                default:
                    toast.error(t('error_default'));
                    break;
            }

            return [];
        }
    } else if(source === 'guide') {
        try {
            const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
            const response = await axios.get('https://guides-to-go.onrender.com/service/get_service', request_headers);
            
            console.log(response.data.services);

            return response.data.services;
        } catch (err) {
            switch (err.response.status) {
                default:
                    toast.error(t('error_default'));
                    break;
            }

            return [];
        }
    } else {
        console.error('getServices() source error');
    }
}