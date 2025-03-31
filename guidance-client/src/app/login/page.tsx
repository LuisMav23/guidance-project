"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useGlobalContext } from '@/providers/GlobalContext';

import axios from 'axios';
import CONFIG from '@/config/config';

import { User } from '@/models/user';

const LoginPage: React.FC = () => {
    const {user, setUser} = useGlobalContext()

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const router = useRouter();




    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.get(
                CONFIG.API_BASE_URL + "api/auth",
                { params: { username, password } },
            );
            console.log("response: ", response.data)
            const user_data = response.data.user 
            setSuccess(true);
            const current_user: User = {
                id: user_data.id,
                username: user_data.username,
                first_name: user_data.first_name,
                last_name: user_data.last_name,
                user_type: user_data.user_type,
            }
            setUser(current_user);
            localStorage.setItem("user", JSON.stringify(current_user));
            console.log("user: ", user_data)
            router.push('/home')
        } catch (err: any) {
            const errorData = err.response?.data;
            setError(errorData?.message || 'Failed to login user');
            router.refresh();
            return;
        }
        console.log('Username:', username, 'Password:', password);
    };

    return (
        <div className="min-h-screen w-full flex justify-center items-center bg-gray-100 px-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h1 className="text-3xl font-bold mb-6 text-center text-black">Log In</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && <p className="text-green-500 mb-4">Login successful!</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">  
                        <label htmlFor="username" className="block text-gray-700 mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 text-black"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 text-black"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                        Log In
                    </button>
                </form>
                <button
                        onClick={()=>{router.push('signup')}}
                        className="w-full bg-transparent text-blue-500 py-2 rounded border-2 mt-3  hover:shadow-blue-600 hover:shadow-sm  transition-all transi"
                    
                    >
                        Create an account
                </button>
            </div>
        </div>
    );
};

export default LoginPage;