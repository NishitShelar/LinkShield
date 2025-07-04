import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    LinkIcon,
    CursorClickIcon,
    FlagIcon,
    ClockIcon,
    GlobeAltIcon,
    DevicePhoneMobileIcon,
    ShieldCheckIcon,
    ShieldExclamationIcon,
} from '@heroicons/react/24/outline';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
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

const LinkDetails = () => {
    const { linkId } = useParams();
    const navigate = useNavigate();
    const [link, setLink] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        status: '',
        customAlias: '',
        tags: '',
        expiresAt: '',
    });

    useEffect(() => {
        const fetchLinkDetails = async () => {
            try {
                const response = await axios.get(`/api/admin/links/${linkId}`);
                setLink(response.data.data.link);
                setFormData({
                    status: response.data.data.link.status,
                    customAlias: response.data.data.link.customAlias || '',
                    tags: response.data.data.link.tags?.join(', ') || '',
                    expiresAt: response.data.data.link.expiresAt
                        ? format(new Date(response.data.data.link.expiresAt), 'yyyy-MM-dd')
                        : '',
                });
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch link details');
                setLoading(false);
            }
        };

        fetchLinkDetails();
    }, [linkId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
            };
            await axios.patch(`/api/admin/links/${linkId}`, submitData);
            setEditMode(false);
            const response = await axios.get(`/api/admin/links/${linkId}`);
            setLink(response.data.data.link);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update link');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this link?')) {
            try {
                await axios.delete(`/api/admin/links/${linkId}`);
                navigate('/admin/links');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete link');
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

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Link Details</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            View and manage link information
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/admin/links')}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Back to Links
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
                                Edit Link
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
                        >
                            Delete Link
                        </button>
                    </div>
                </div>
            </div>

            {/* Link Information */}
            <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
                <div className="p-6">
                    {editMode ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    >
                                        <option value="active">Active</option>
                                        <option value="disabled">Disabled</option>
                                        <option value="flagged">Flagged</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Custom Alias
                                    </label>
                                    <input
                                        type="text"
                                        name="customAlias"
                                        value={formData.customAlias}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Tags (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Expiration Date
                                    </label>
                                    <input
                                        type="date"
                                        name="expiresAt"
                                        value={formData.expiresAt}
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
                                <h3 className="text-lg font-medium text-gray-900">Link Information</h3>
                                <dl className="mt-4 space-y-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Short Link</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <LinkIcon className="h-5 w-5 text-gray-400 mr-2" />
                                                {link.shortCode}
                                            </div>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Original URL</dt>
                                        <dd className="mt-1 text-sm text-gray-900 break-all">
                                            {link.originalUrl}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                                        <dd className="mt-1">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    link.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : link.status === 'flagged'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {link.status}
                                            </span>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Created</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {format(new Date(link.createdAt), 'PPP')}
                                        </dd>
                                    </div>
                                    {link.expiresAt && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">
                                                Expires
                                            </dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {format(new Date(link.expiresAt), 'PPP')}
                                            </dd>
                                        </div>
                                    )}
                                    {link.tags?.length > 0 && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Tags</dt>
                                            <dd className="mt-1">
                                                <div className="flex flex-wrap gap-2">
                                                    {link.tags.map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Safety Information</h3>
                                <dl className="mt-4 space-y-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Safety Status
                                        </dt>
                                        <dd className="mt-1">
                                            <div className="flex items-center">
                                                {link.safetyStatus?.isSafe ? (
                                                    <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-2" />
                                                ) : (
                                                    <ShieldExclamationIcon className="h-5 w-5 text-red-500 mr-2" />
                                                )}
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        link.safetyStatus?.isSafe
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {link.safetyStatus?.isSafe ? 'Safe' : 'Unsafe'}
                                                </span>
                                            </div>
                                        </dd>
                                    </div>
                                    {link.safetyStatus?.threatTypes?.length > 0 && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">
                                                Threat Types
                                            </dt>
                                            <dd className="mt-1">
                                                <div className="flex flex-wrap gap-2">
                                                    {link.safetyStatus.threatTypes.map((threat) => (
                                                        <span
                                                            key={threat}
                                                            className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full"
                                                        >
                                                            {threat}
                                                        </span>
                                                    ))}
                                                </div>
                                            </dd>
                                        </div>
                                    )}
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Last Checked
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {formatDistanceToNow(
                                                new Date(link.safetyStatus?.lastChecked),
                                                { addSuffix: true },
                                            )}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Total Clicks"
                    value={link.stats.clickStats.totalClicks}
                    icon={CursorClickIcon}
                    color="bg-blue-100"
                />
                <StatCard
                    title="Unique Visitors"
                    value={link.stats.clickStats.uniqueVisitors}
                    icon={UserIcon}
                    color="bg-green-100"
                />
                <StatCard
                    title="Last Clicked"
                    value={formatDistanceToNow(new Date(link.stats.clickStats.lastClicked), {
                        addSuffix: true,
                    })}
                    icon={ClockIcon}
                    color="bg-purple-100"
                />
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
                <nav className="-mb-px flex space-x-8">
                    {['overview', 'clicks', 'devices', 'locations'].map((tab) => (
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
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Click Trends
                                </h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={link.stats.clickStats.hourlyStats}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="timestamp"
                                                tickFormatter={(value) =>
                                                    format(new Date(value), 'MMM d, HH:mm')
                                                }
                                            />
                                            <YAxis />
                                            <Tooltip
                                                labelFormatter={(value) =>
                                                    format(new Date(value), 'PPP p')
                                                }
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="count"
                                                stroke="#3B82F6"
                                                strokeWidth={2}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Device Distribution */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Device Distribution
                                </h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={link.stats.deviceStats}
                                                dataKey="count"
                                                nameKey="deviceType"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                label
                                            >
                                                {link.stats.deviceStats.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'clicks' && (
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Device
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Referrer
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {link.stats.clickStats.recentClicks.map((click) => (
                                        <tr key={click._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDistanceToNow(new Date(click.timestamp), {
                                                    addSuffix: true,
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400 mr-2" />
                                                    <div>
                                                        <div className="text-sm text-gray-900">
                                                            {click.device.browser}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {click.device.os}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-2" />
                                                    <div className="text-sm text-gray-900">
                                                        {click.location?.country || 'Unknown'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {click.referrer || 'Direct'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'devices' && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Browser Distribution */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Browser Distribution
                                </h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={link.stats.deviceStats.reduce((acc, device) => {
                                                device.browsers.forEach((browser) => {
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
                                                return acc;
                                            }, [])}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#3B82F6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* OS Distribution */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Operating System Distribution
                                </h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={link.stats.deviceStats.reduce((acc, device) => {
                                                    const existing = acc.find(
                                                        (item) => item.name === device.os,
                                                    );
                                                    if (existing) {
                                                        existing.count += device.count;
                                                    } else {
                                                        acc.push({
                                                            name: device.os,
                                                            count: device.count,
                                                        });
                                                    }
                                                    return acc;
                                                }, [])}
                                                dataKey="count"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                label
                                            >
                                                {link.stats.deviceStats.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'locations' && (
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
                                            {link.stats.geoStats
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
                                                            {(
                                                                (stat.count /
                                                                    link.stats.clickStats.totalClicks) *
                                                                100
                                                            ).toFixed(1)}
                                                            %
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* City Distribution */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    City Distribution
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    City
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Country
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Clicks
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {link.stats.geoStats
                                                .reduce((acc, country) => {
                                                    country.cities.forEach((city) => {
                                                        acc.push({
                                                            city: city.name,
                                                            country: country.country,
                                                            count: city.count,
                                                        });
                                                    });
                                                    return acc;
                                                }, [])
                                                .sort((a, b) => b.count - a.count)
                                                .slice(0, 10)
                                                .map((stat, index) => (
                                                    <tr key={index}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {stat.city}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {stat.country}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {stat.count}
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

export default LinkDetails; 