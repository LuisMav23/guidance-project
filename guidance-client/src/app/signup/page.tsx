"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CONFIG from '@/config/config';

import axios from 'axios';

interface SignUpData {
    username: string;
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
}

const SignUpPage: React.FC = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<SignUpData>({
        username: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
    });

    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const response = await axios.post(
                CONFIG.API_BASE_URL + "api/create_user",
                {
                    username: formData.username,
                    password: formData.password,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );
            console.log('User created:', response.data);
            setSuccess(true);
            router.push('/login');
        } catch (err: any) {
            const errorData = err.response?.data;
            setError(errorData?.message || 'Failed to create user');
            return;
        }
    };

    return (
        <div className="min-h-screen w-full flex justify-center items-center bg-gray-100 px-4 py-12">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h1 className="text-3xl font-bold mb-6 text-center text-black">Sign Up</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && <p className="text-green-500 mb-4">Sign up successful!</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-gray-700 mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder="Enter your username"
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 text-black"
                        />
                    </div>
                    <div>
                        <label htmlFor="firstName" className="block text-gray-700 mb-2">
                            First Name
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            placeholder="Enter your first name"
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 text-black"
                        />
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-gray-700 mb-2">
                            Last Name
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            placeholder="Enter your last name"
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 text-black"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter your password"
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 text-black"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Confirm your password"
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 text-black"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignUpPage;