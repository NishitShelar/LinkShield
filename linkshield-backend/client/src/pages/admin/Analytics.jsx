import React, { useState, useEffect } from 'react';
import {
    ChartBarIcon,
    UserGroupIcon,
    LinkIcon,
    CursorClickIcon,
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
    Legend,
    ResponsiveContainer,
} from 'recharts';
import axios from 'axios';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
                {change && (
                    <p
                        className={`text-sm mt-2 ${
                            change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                        {change > 0 ? '↑' : '↓'} {Math.abs(change)}% from last period
                    </p>
                )}
            </div>
            <div className={`p-3 rounded-full ${color}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
        </div>
    </div>
);

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState('7d');
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const endDate = endOfDay(new Date());
                let startDate;
                switch (dateRange) {
                    case '24h':
                        startDate = subDays(startOfDay(new Date()), 1);
                        break;
                    case '7d':
                        startDate = subDays(startOfDay(new Date()), 7);
                        break;
                    case '30d':
                        startDate = subDays(startOfDay(new Date()), 30);
                        break;
                    case '90d':
                        startDate = subDays(startOfDay(new Date()), 90);
                        break;
                    default:
                        startDate = subDays(startOfDay(new Date()), 7);
                }

                const response = await axios.get('/api/admin/analytics', {
                    params: {
                        startDate: startDate.toISOString(),
                        endDate: endDate.toISOString(),
                    },
                });
                setStats(response.data.data);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch analytics data');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [dateRange]);

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
                        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Comprehensive platform analytics and insights
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="90d">Last 90 Days</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Users"
                    value={stats.userStats.totalUsers}
                    change={stats.userStats.userGrowth}
                    icon={UserGroupIcon}
                    color="bg-blue-100"
                />
                <StatCard
                    title="Active Links"
                    value={stats.linkStats.activeLinks}
                    change={stats.linkStats.linkGrowth}
                    icon={LinkIcon}
                    color="bg-green-100"
                />
                <StatCard
                    title="Total Clicks"
                    value={stats.clickStats.totalClicks}
                    change={stats.clickStats.clickGrowth}
                    icon={CursorClickIcon}
                    color="bg-purple-100"
                />
                <StatCard
                    title="Flagged Links"
                    value={stats.safetyStats.flaggedLinks}
                    change={stats.safetyStats.flagGrowth}
                    icon={ShieldExclamationIcon}
                    color="bg-red-100"
                />
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
                <nav className="-mb-px flex space-x-8">
                    {['overview', 'users', 'links', 'safety', 'geography'].map((tab) => (
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
                                            data={stats.clickStats.dailyStats}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(value) =>
                                                    format(new Date(value), 'MMM d')
                                                }
                                            />
                                            <YAxis />
                                            <Tooltip
                                                labelFormatter={(value) =>
                                                    format(new Date(value), 'PPP')
                                                }
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="clicks"
                                                name="Total Clicks"
                                                stroke="#3B82F6"
                                                strokeWidth={2}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="uniqueClicks"
                                                name="Unique Clicks"
                                                stroke="#10B981"
                                                strokeWidth={2}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* User Growth */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    User Growth
                                </h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={stats.userStats.dailyStats}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(value) =>
                                                    format(new Date(value), 'MMM d')
                                                }
                                            />
                                            <YAxis />
                                            <Tooltip
                                                labelFormatter={(value) =>
                                                    format(new Date(value), 'PPP')
                                                }
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="newUsers"
                                                name="New Users"
                                                stroke="#3B82F6"
                                                strokeWidth={2}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="activeUsers"
                                                name="Active Users"
                                                stroke="#10B981"
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
                                                data={stats.deviceStats}
                                                dataKey="count"
                                                nameKey="deviceType"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                label
                                            >
                                                {stats.deviceStats.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Safety Status */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Safety Status
                                </h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={stats.safetyStats.threatTypes}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="type" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar
                                                dataKey="count"
                                                name="Threat Count"
                                                fill="#EF4444"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* User Demographics */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    User Demographics
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Plan
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Users
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Percentage
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {stats.userStats.planDistribution.map((plan) => (
                                                <tr key={plan.plan}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {plan.plan}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {plan.count}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {(
                                                            (plan.count /
                                                                stats.userStats.totalUsers) *
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

                            {/* User Activity */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    User Activity
                                </h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={stats.userStats.activityStats}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(value) =>
                                                    format(new Date(value), 'MMM d')
                                                }
                                            />
                                            <YAxis />
                                            <Tooltip
                                                labelFormatter={(value) =>
                                                    format(new Date(value), 'PPP')
                                                }
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="logins"
                                                name="Logins"
                                                stroke="#3B82F6"
                                                strokeWidth={2}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="linkCreations"
                                                name="Link Creations"
                                                stroke="#10B981"
                                                strokeWidth={2}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'links' && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Link Creation Trends */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Link Creation Trends
                                </h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={stats.linkStats.creationStats}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(value) =>
                                                    format(new Date(value), 'MMM d')
                                                }
                                            />
                                            <YAxis />
                                            <Tooltip
                                                labelFormatter={(value) =>
                                                    format(new Date(value), 'PPP')
                                                }
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="created"
                                                name="Created"
                                                stroke="#3B82F6"
                                                strokeWidth={2}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="expired"
                                                name="Expired"
                                                stroke="#EF4444"
                                                strokeWidth={2}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Link Performance */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Link Performance
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Metric
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Value
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    Average Clicks per Link
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {stats.linkStats.avgClicksPerLink.toFixed(2)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    Most Clicked Link
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {stats.linkStats.mostClickedLink.clicks} clicks
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    Average Link Lifetime
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {stats.linkStats.avgLinkLifetime} days
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'safety' && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Safety Trends */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Safety Trends
                                </h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={stats.safetyStats.dailyStats}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(value) =>
                                                    format(new Date(value), 'MMM d')
                                                }
                                            />
                                            <YAxis />
                                            <Tooltip
                                                labelFormatter={(value) =>
                                                    format(new Date(value), 'PPP')
                                                }
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="flagged"
                                                name="Flagged Links"
                                                stroke="#EF4444"
                                                strokeWidth={2}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="blocked"
                                                name="Blocked Attempts"
                                                stroke="#F59E0B"
                                                strokeWidth={2}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Threat Distribution */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Threat Distribution
                                </h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats.safetyStats.threatDistribution}
                                                dataKey="count"
                                                nameKey="type"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                label
                                            >
                                                {stats.safetyStats.threatDistribution.map(
                                                    (entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={COLORS[index % COLORS.length]}
                                                        />
                                                    ),
                                                )}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'geography' && (
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
                                                    Users
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Percentage
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {stats.geoStats.countryStats
                                                .sort((a, b) => b.clicks - a.clicks)
                                                .map((stat) => (
                                                    <tr key={stat.country}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {stat.country}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {stat.clicks}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {stat.users}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {(
                                                                (stat.clicks /
                                                                    stats.clickStats.totalClicks) *
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
                                    Top Cities
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
                                            {stats.geoStats.cityStats
                                                .sort((a, b) => b.clicks - a.clicks)
                                                .slice(0, 10)
                                                .map((stat) => (
                                                    <tr key={`${stat.city}-${stat.country}`}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {stat.city}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {stat.country}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {stat.clicks}
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

export default Analytics; 