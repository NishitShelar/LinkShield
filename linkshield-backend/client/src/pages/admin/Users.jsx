import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    PencilIcon,
    TrashIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const UserTable = ({ users, onEdit, onDelete, onSort, sortConfig }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => onSort('name')}
                    >
                        <div className="flex items-center space-x-1">
                            <span>User</span>
                            {sortConfig.key === 'name' && (
                                sortConfig.direction === 'asc' ? (
                                    <ChevronUpIcon className="h-4 w-4" />
                                ) : (
                                    <ChevronDownIcon className="h-4 w-4" />
                                )
                            )}
                        </div>
                    </th>
                    <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => onSort('email')}
                    >
                        <div className="flex items-center space-x-1">
                            <span>Email</span>
                            {sortConfig.key === 'email' && (
                                sortConfig.direction === 'asc' ? (
                                    <ChevronUpIcon className="h-4 w-4" />
                                ) : (
                                    <ChevronDownIcon className="h-4 w-4" />
                                )
                            )}
                        </div>
                    </th>
                    <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => onSort('role')}
                    >
                        <div className="flex items-center space-x-1">
                            <span>Role</span>
                            {sortConfig.key === 'role' && (
                                sortConfig.direction === 'asc' ? (
                                    <ChevronUpIcon className="h-4 w-4" />
                                ) : (
                                    <ChevronDownIcon className="h-4 w-4" />
                                )
                            )}
                        </div>
                    </th>
                    <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => onSort('subscription.plan')}
                    >
                        <div className="flex items-center space-x-1">
                            <span>Plan</span>
                            {sortConfig.key === 'subscription.plan' && (
                                sortConfig.direction === 'asc' ? (
                                    <ChevronUpIcon className="h-4 w-4" />
                                ) : (
                                    <ChevronDownIcon className="h-4 w-4" />
                                )
                            )}
                        </div>
                    </th>
                    <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => onSort('metadata.lastLogin')}
                    >
                        <div className="flex items-center space-x-1">
                            <span>Last Active</span>
                            {sortConfig.key === 'metadata.lastLogin' && (
                                sortConfig.direction === 'asc' ? (
                                    <ChevronUpIcon className="h-4 w-4" />
                                ) : (
                                    <ChevronDownIcon className="h-4 w-4" />
                                )
                            )}
                        </div>
                    </th>
                    <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                        Stats
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <UserIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    <div className="text-sm text-gray-500">
                                        Joined {formatDistanceToNow(new Date(user.metadata.signupDate), { addSuffix: true })}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                            }`}>
                                {user.role}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    user.subscription.plan === 'pro' ? 'bg-blue-100 text-blue-800' :
                                    user.subscription.plan === 'enterprise' ? 'bg-indigo-100 text-indigo-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {user.subscription.plan}
                                </span>
                                <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    user.subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                                    user.subscription.status === 'trial' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {user.subscription.status}
                                </span>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDistanceToNow(new Date(user.metadata.lastLogin), { addSuffix: true })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                                <div>
                                    <span className="font-medium text-gray-900">{user.stats.linkCount}</span>
                                    <span className="text-gray-500"> links</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-900">{user.stats.clickCount}</span>
                                    <span className="text-gray-500"> clicks</span>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-3">
                                <Link
                                    to={`/admin/users/${user._id}`}
                                    className="text-blue-600 hover:text-blue-900"
                                >
                                    <PencilIcon className="h-5 w-5" />
                                </Link>
                                <button
                                    onClick={() => onDelete(user._id)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        role: '',
        plan: '',
        status: '',
    });
    const [sortConfig, setSortConfig] = useState({
        key: 'metadata.lastLogin',
        direction: 'desc',
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
    });
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            const queryParams = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...filters,
                sortBy: sortConfig.key,
                sortOrder: sortConfig.direction,
            });

            const response = await axios.get(`/api/admin/users?${queryParams}`);
            setUsers(response.data.data.users);
            setPagination(response.data.data.pagination);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch users');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [filters, sortConfig, pagination.page]);

    const handleSort = (key) => {
        setSortConfig({
            key,
            direction:
                sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
        });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await axios.delete(`/api/admin/users/${userId}`);
                fetchUsers();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-600 text-center">
                    <p className="text-xl font-semibold">Error</p>
                    <p className="mt-2">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage user accounts, roles, and subscriptions
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Search users..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <select
                        name="role"
                        value={filters.role}
                        onChange={handleFilterChange}
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="">All Roles</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                    <select
                        name="plan"
                        value={filters.plan}
                        onChange={handleFilterChange}
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="">All Plans</option>
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                        <option value="enterprise">Enterprise</option>
                    </select>
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="trial">Trial</option>
                        <option value="expired">Expired</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <UserTable
                    users={users}
                    onEdit={(userId) => navigate(`/admin/users/${userId}`)}
                    onDelete={handleDelete}
                    onSort={handleSort}
                    sortConfig={sortConfig}
                />
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
                <div className="flex-1 flex justify-between sm:hidden">
                    <button
                        onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.pages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing{' '}
                            <span className="font-medium">
                                {(pagination.page - 1) * pagination.limit + 1}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium">
                                {Math.min(pagination.page * pagination.limit, pagination.total)}
                            </span>{' '}
                            of{' '}
                            <span className="font-medium">{pagination.total}</span> results
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setPagination((prev) => ({ ...prev, page }))}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                        page === pagination.page
                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Users; 