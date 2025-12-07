import axios from 'axios';

export const SERVER_URL = 'https://localhost:44367';

export const api = axios.create({
    baseURL: `${SERVER_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});