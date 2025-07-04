import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    UsersIcon,
    LinkIcon,
    CursorClickIcon,
    FlagIcon,
    ChartBarIcon,
    ClockIcon,
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
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const StatCard = ({ title, value, icon: Icon, change, changeType }) => (
    <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
                {change && (
                    <p className={`text-sm mt-2 ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                        {changeType === 'increase' ? '↑' : '↓'} {change}%
                    </p>
                )}
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
                <Icon className="h-6 w-6 text-blue-600" />
            </div>
        </div>
    </div>
);

const RecentActivityCard = ({ title, items, type }) => (
    <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-4">
            {items.map((item, index) => (
                <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                        {type === 'user' && (
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <UsersIcon className="h-6 w-6 text-blue-600" />
                            </div>
                        )}
                        {type === 'link' && (
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <LinkIcon className="h-6 w-6 text-green-600" />
                            </div>
                        )}
                        {type === 'click' && (
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <CursorClickIcon className="h-6 w-6 text-purple-600" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {type === 'user' && item.name}
                            {type === 'link' && item.originalUrl}
                            {type === 'click' && `${item.link?.shortCode} → ${item.link?.originalUrl}`}
                        </p>
                        <p className="text-sm text-gray-500">
                            {type === 'user' && item.email}
                            {type === 'link' && item.shortCode}
                            {type === 'click' && formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const response = await axios.get('/api/admin/dashboard');
                setStats(response.data.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch dashboard stats');
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

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

    const { overview, subscriptionStats, recentActivity } = stats;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Monitor your platform's performance and activity
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Users"
                    value={overview.users.total}
                    icon={UsersIcon}
                    change={5}
                    changeType="increase"
                />
                <StatCard
                    title="Active Links"
                    value={overview.links.active}
                    icon={LinkIcon}
                    change={12}
                    changeType="increase"
                />
                <StatCard
                    title="Total Clicks"
                    value={overview.clicks.total}
                    icon={CursorClickIcon}
                    change={8}
                    changeType="increase"
                />
                <StatCard
                    title="Flagged Links"
                    value={overview.links.flagged}
                    icon={FlagIcon}
                    change={-2}
                    changeType="decrease"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Click Trends */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Click Trends</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={[
                                    { time: '24h', clicks: overview.clicks.last24h },
                                    { time: '7d', clicks: overview.clicks.last7d },
                                    { time: '30d', clicks: overview.clicks.last30d },
                                ]}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
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

                {/* Subscription Distribution */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Distribution</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={subscriptionStats}
                                    dataKey="active"
                                    nameKey="plan"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {subscriptionStats.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <RecentActivityCard
                    title="Recent Users"
                    items={recentActivity.users}
                    type="user"
                />
                <RecentActivityCard
                    title="Recent Links"
                    items={recentActivity.links}
                    type="link"
                />
                <RecentActivityCard
                    title="Recent Clicks"
                    items={recentActivity.clicks}
                    type="click"
                />
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                    to="/admin/users"
                    className="flex items-center justify-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                    <UsersIcon className="h-6 w-6 text-blue-600 mr-2" />
                    <span className="text-gray-900">Manage Users</span>
                </Link>
                <Link
                    to="/admin/links"
                    className="flex items-center justify-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                    <LinkIcon className="h-6 w-6 text-green-600 mr-2" />
                    <span className="text-gray-900">Manage Links</span>
                </Link>
                <Link
                    to="/admin/analytics"
                    className="flex items-center justify-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                    <ChartBarIcon className="h-6 w-6 text-purple-600 mr-2" />
                    <span className="text-gray-900">View Analytics</span>
                </Link>
                <Link
                    to="/admin/activity"
                    className="flex items-center justify-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                    <ClockIcon className="h-6 w-6 text-orange-600 mr-2" />
                    <span className="text-gray-900">Activity Log</span>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard; 