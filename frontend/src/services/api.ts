import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const searchByImage = async (file: File, limit: number, distanceKm: number, lat: number, lon: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('limit', limit.toString());
    formData.append('distance_km', distanceKm.toString());
    formData.append('user_lat', lat.toString());
    formData.append('user_lon', lon.toString());

    const response = await api.post('/search/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const searchByText = async (query: string, limit: number, lat: number, lon: number) => {
    const formData = new FormData();
    formData.append('query', query);
    formData.append('limit', limit.toString());
    formData.append('user_lat', lat.toString());
    formData.append('user_lon', lon.toString());

    const response = await api.post('/search/text', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getBenchmark = async (query: string) => {
    const response = await api.get(`/benchmark?query=${query}`);
    return response.data;
};

export default api;
