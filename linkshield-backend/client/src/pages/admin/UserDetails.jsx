import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    UserIcon,
    LinkIcon,
    CursorClickIcon,
    ClockIcon,
    GlobeAltIcon,
    DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import axios from 'axios';
import { formatDistanceToNow, format } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${color}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
        </div>
    </div>
);

const UserDetails = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        subscription: {
            plan: '',
            status: '',
            endDate: '',
        },
    });

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axios.get(`/api/admin/users/${userId}`);
                setUser(response.data.data.user);
                setFormData({
                    name: response.data.data.user.name,
                    email: response.data.data.user.email,
                    role: response.data.data.user.role,
                    subscription: {
                        plan: response.data.data.user.subscription.plan,
                        status: response.data.data.user.subscription.status,
                        endDate: response.data.data.user.subscription.endDate
                            ? format(new Date(response.data.data.user.subscription.endDate), 'yyyy-MM-dd')
                            : '',
                    },
                });
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch user details');
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [userId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('subscription.')) {
            const field = name.split('.')[1];
            setFormData((prev) => ({
                ...prev,
                subscription: {
                    ...prev.subscription,
                    [field]: value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(`/api/admin/users/${userId}`, formData);
            setEditMode(false);
            const response = await axios.get(`/api/admin/users/${userId}`);
            setUser(response.data.data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update user');
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
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            View and manage user information
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Back to Users
                        </button>
                        {editMode ? (
                            <button
                                onClick={() => setEditMode(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        ) : (
                            <button
                                onClick={() => setEditMode(true)}
                                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Edit User
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* User Profile */}
            <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
                <div className="p-6">
                    {editMode ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Role
                                    </label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Subscription Plan
                                    </label>
                                    <select
                                        name="subscription.plan"
                                        value={formData.subscription.plan}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    >
                                        <option value="free">Free</option>
                                        <option value="pro">Pro</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Subscription Status
                                    </label>
                                    <select
                                        name="subscription.status"
                                        value={formData.subscription.status}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    >
                                        <option value="active">Active</option>
                                        <option value="trial">Trial</option>
                                        <option value="expired">Expired</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Subscription End Date
                                    </label>
                                    <input
                                        type="date"
                                        name="subscription.endDate"
                                        value={formData.subscription.endDate}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                                <dl className="mt-4 space-y-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Role</dt>
                                        <dd className="mt-1">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {format(new Date(user.metadata.signupDate), 'PPP')}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Subscription Details</h3>
                                <dl className="mt-4 space-y-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Plan</dt>
                                        <dd className="mt-1">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                user.subscription.plan === 'pro' ? 'bg-blue-100 text-blue-800' :
                                                user.subscription.plan === 'enterprise' ? 'bg-indigo-100 text-indigo-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {user.subscription.plan}
                                            </span>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                                        <dd className="mt-1">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                user.subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                                                user.subscription.status === 'trial' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {user.subscription.status}
                                            </span>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {format(new Date(user.subscription.startDate), 'PPP')}
                                        </dd>
                                    </div>
                                    {user.subscription.endDate && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">End Date</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {format(new Date(user.subscription.endDate), 'PPP')}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Total Links"
                    value={user.stats.linkCount}
                    icon={LinkIcon}
                    color="bg-blue-100"
                />
                <StatCard
                    title="Total Clicks"
                    value={user.stats.clickCount}
                    icon={CursorClickIcon}
                    color="bg-green-100"
                />
                <StatCard
                    title="Last Active"
                    value={formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })}
                    icon={ClockIcon}
                    color="bg-purple-100"
                />
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
                <nav className="-mb-px flex space-x-8">
                    {['overview', 'links', 'activity', 'analytics'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${
                                activeTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {activeTab === 'overview' && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Click Trends */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Click Trends</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={user.links.reduce((acc, link) => {
                                                const hourlyStats = link.stats.clickStats.hourlyStats;
                                                hourlyStats.forEach((stat) => {
                                                    const existing = acc.find(
                                                        (item) => item.timestamp === stat.timestamp,
                                                    );
                                                    if (existing) {
                                                        existing.clicks += stat.count;
                                                    } else {
                                                        acc.push({
                                                            timestamp: stat.timestamp,
                                                            clicks: stat.count,
                                                        });
                                                    }
                                                });
                                                return acc;
                                            }, [])}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="timestamp"
                                                tickFormatter={(value) => format(new Date(value), 'MMM d, HH:mm')}
                                            />
                                            <YAxis />
                                            <Tooltip
                                                labelFormatter={(value) => format(new Date(value), 'PPP p')}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="clicks"
                                                stroke="#3B82F6"
                                                strokeWidth={2}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Device Distribution */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Device Distribution</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={user.links.reduce((acc, link) => {
                                                link.stats.deviceStats.forEach((stat) => {
                                                    const existing = acc.find(
                                                        (item) => item.deviceType === stat.deviceType,
                                                    );
                                                    if (existing) {
                                                        existing.count += stat.count;
                                                    } else {
                                                        acc.push({
                                                            deviceType: stat.deviceType,
                                                            count: stat.count,
                                                        });
                                                    }
                                                });
                                                return acc;
                                            }, [])}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="deviceType" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#3B82F6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'links' && (
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Link
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Clicks
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Last Clicked
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {user.links.map((link) => (
                                        <tr key={link._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <LinkIcon className="h-5 w-5 text-gray-400 mr-2" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {link.shortCode}
                                                        </div>
                                                        <div className="text-sm text-gray-500 truncate max-w-xs">
                                                            {link.originalUrl}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    link.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    link.status === 'flagged' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {link.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {format(new Date(link.createdAt), 'PPP')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {link.stats.clickStats.totalClicks}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {link.stats.clickStats.lastClicked
                                                    ? formatDistanceToNow(new Date(link.stats.clickStats.lastClicked), {
                                                          addSuffix: true,
                                                      })
                                                    : 'Never'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="p-6">
                        <div className="space-y-6">
                            {user.loginHistory.map((login, index) => (
                                <div key={index} className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                            login.isSuccessful ? 'bg-green-100' : 'bg-red-100'
                                        }`}>
                                            <UserIcon
                                                className={`h-6 w-6 ${
                                                    login.isSuccessful ? 'text-green-600' : 'text-red-600'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">
                                            {login.isSuccessful ? 'Successful Login' : 'Failed Login Attempt'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {formatDistanceToNow(new Date(login.timestamp), {
                                                addSuffix: true,
                                            })}
                                        </p>
                                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <GlobeAltIcon className="h-4 w-4 mr-1" />
                                                {login.location?.country || 'Unknown Location'}
                                            </div>
                                            <div className="flex items-center">
                                                <DevicePhoneMobileIcon className="h-4 w-4 mr-1" />
                                                {login.device?.browser} on {login.device?.os}
                                            </div>
                                            <div className="flex items-center">
                                                <ClockIcon className="h-4 w-4 mr-1" />
                                                {format(new Date(login.timestamp), 'p')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Geographic Distribution */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Geographic Distribution
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Country
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Clicks
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Percentage
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {user.links
                                                .reduce((acc, link) => {
                                                    link.stats.geoStats.forEach((stat) => {
                                                        const existing = acc.find(
                                                            (item) => item.country === stat.country,
                                                        );
                                                        if (existing) {
                                                            existing.count += stat.count;
                                                        } else {
                                                            acc.push({
                                                                country: stat.country,
                                                                count: stat.count,
                                                            });
                                                        }
                                                    });
                                                    return acc;
                                                }, [])
                                                .sort((a, b) => b.count - a.count)
                                                .map((stat, index) => (
                                                    <tr key={index}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {stat.country}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {stat.count}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {((stat.count / user.stats.clickCount) * 100).toFixed(1)}%
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Device and Browser Stats */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Device and Browser Statistics
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Device/Browser
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Count
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Percentage
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {user.links
                                                .reduce((acc, link) => {
                                                    link.stats.deviceStats.forEach((stat) => {
                                                        stat.browsers.forEach((browser) => {
                                                            const existing = acc.find(
                                                                (item) => item.name === browser,
                                                            );
                                                            if (existing) {
                                                                existing.count += 1;
                                                            } else {
                                                                acc.push({
                                                                    name: browser,
                                                                    count: 1,
                                                                });
                                                            }
                                                        });
                                                    });
                                                    return acc;
                                                }, [])
                                                .sort((a, b) => b.count - a.count)
                                                .map((stat, index) => (
                                                    <tr key={index}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {stat.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {stat.count}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {((stat.count / user.stats.clickCount) * 100).toFixed(1)}%
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDetails; 