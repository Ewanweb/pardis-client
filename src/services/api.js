import axios from 'axios';

export const api = axios.create({
    baseURL: 'https://localhost:44367/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});