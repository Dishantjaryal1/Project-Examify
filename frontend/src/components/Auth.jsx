import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';

const Auth = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        const endpoint = isRegistering ? '/register' : '/login';

        try {
            const response = await axios.post(`${API_URL}/auth${endpoint}`, { username, password, role });
            
            if (isRegistering) {
                setSuccessMessage('Registration successful! You can now log in.');
            } else {
                // Save token, role, and username to localStorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.role);
                localStorage.setItem('username', response.data.username);

                window.location.href = '/dashboard';
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    {isRegistering ? 'Register' : 'Login'}
                </h2>
                {error && (
                    <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 rounded-lg">
                        {successMessage}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="student">student</option>
                        <option value="examiner">examiner</option>
                    </select>
                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                    >
                        {isRegistering ? 'Register' : 'Login'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="w-full py-2 text-blue-600 font-medium hover:underline"
                    >
                        Switch to {isRegistering ? 'Login' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Auth;
