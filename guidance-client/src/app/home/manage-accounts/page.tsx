'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobalContext } from '@/providers/GlobalContext';
import { User } from '@/models/user';
import axios from 'axios';
import CONFIG from '@/config/config';

const ManageAccounts = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    first_name: '',
    last_name: '',
    password: '',
  });
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const router = useRouter();
  const { user } = useGlobalContext();

  useEffect(() => {
    // Check if current user is admin
    if (user.user_type !== 'admin') {
      router.push('/home');
      return;
    }
    
    fetchUsers();
  }, [router, user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch users using axios and CONFIG.API_BASE_URL
      const response = await axios.get(`${CONFIG.API_BASE_URL}/api/users`);
      console.log(response.data.users);
      setUsers(response.data.users);
    } catch (err) {
      setError('Error loading users. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      // Delete user using axios and CONFIG.API_BASE_URL
      const response = await axios.delete(`${CONFIG.API_BASE_URL}/api/users/${userId}`);

      if (response.status !== 200) {
        throw new Error('Failed to delete user');
      }

      // Remove user from the list
      setUsers(users.filter(user => user.id !== userId));
      setSuccessMessage('User deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Error deleting user. Please try again.');
      console.error(err);
      
      // Clear error message after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Use axios to call the API endpoint with CONFIG.API_BASE_URL
      const response = await axios.post(`${CONFIG.API_BASE_URL}/api/create_user`, {
        username: newAdmin.username,
        password: newAdmin.password,
        first_name: newAdmin.first_name,
        last_name: newAdmin.last_name,
        user_type: 'admin'
      });

      if (response.status !== 200) {
        throw new Error('Failed to create admin user');
      }

      // Reset form and refresh user list
      setNewAdmin({
        username: '',
        first_name: '',
        last_name: '',
        password: '',
      });
      setShowAddAdmin(false);
      fetchUsers();
      setSuccessMessage('Admin user created successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Error creating admin user. Please try again.');
      console.error(err);
      
      // Clear error message after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 text-gray-700">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Manage Accounts</h1>
        
        {/* Success and Error Messages */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* Add Admin Button */}
        <div className="mb-6">
          <button 
            onClick={() => setShowAddAdmin(!showAddAdmin)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            {showAddAdmin ? 'Cancel' : 'Add New Admin'}
          </button>
        </div>
        
        {/* Add Admin Form */}
        {showAddAdmin && (
          <div className="bg-white p-6 rounded shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Admin</h2>
            <form onSubmit={handleAddAdmin}>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={newAdmin.username}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={newAdmin.first_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={newAdmin.last_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={newAdmin.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Create Admin
              </button>
            </form>
          </div>
        )}
        
        {/* Users Table */}
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                Array.isArray(users) ? users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.first_name} {user.last_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.user_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                        >
                            Delete
                        </button>
                    </td>
                  </tr>
                )) : null
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageAccounts;
