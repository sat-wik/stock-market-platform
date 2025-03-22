import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Create axios instance with custom config
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 10000 // 10 seconds timeout
});

// Add request interceptor to log requests
axiosInstance.interceptors.request.use(
    config => {
        console.log(`Making ${config.method.toUpperCase()} request to ${config.url}`);
        console.log('Request headers:', config.headers);
        return config;
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
    response => {
        console.log(`Received response from ${response.config.url}:`, response.status);
        return response;
    },
    error => {
        if (error.code === 'ERR_NETWORK') {
            console.error('Network error - please check your connection and try again');
            console.error('API URL:', API_BASE_URL);
        } else if (error.response) {
            console.error('Response error:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
        } else if (error.request) {
            console.error('Request error - no response received');
        } else {
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await axiosInstance.get('/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setUser(response.data.user);
        } catch (error) {
            console.error('Error fetching user:', error);
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            delete axios.defaults.headers.common['Authorization'];
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            console.log('Making login request...');
            const response = await axiosInstance.post('/api/auth/login', { email, password });
            
            console.log('Login response:', response.data);
            const { token: newToken, user } = response.data;
            
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(user);
            
            return { success: true };
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    };

    const register = async (username, email, password) => {
        try {
            const response = await axios.post('/api/auth/register', {
                username,
                email,
                password
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const { token, user } = response.data;
            if (!token) {
                throw new Error('No token received');
            }
            
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            return { success: true };
        } catch (error) {
            console.error('Register error:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'An error occurred'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const updateWatchlist = async (symbol, action) => {
        try {
            const response = await axios.patch('/api/auth/watchlist', {
                symbol,
                action
            });
            setUser(prev => ({
                ...prev,
                watchlist: response.data.watchlist
            }));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'An error occurred'
            };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            token,
            login,
            register,
            logout,
            updateWatchlist
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
