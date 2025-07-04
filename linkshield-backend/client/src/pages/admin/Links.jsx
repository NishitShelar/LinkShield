import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LinkIcon,
    CursorClickIcon,
    FlagIcon,
    ClockIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { formatDistanceToNow, format } from 'date-fns';

const LinkTable = ({ links, onSort, sortField, sortDirection }) => {
    const navigate = useNavigate();

    const getSortIcon = (field) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => onSort('shortCode')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Short Link</span>
                                {getSortIcon('shortCode')}
                            </div>
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => onSort('originalUrl')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Original URL</span>
                                {getSortIcon('originalUrl')}
                            </div>
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => onSort('status')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Status</span>
                                {getSortIcon('status')}
                            </div>
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => onSort('createdAt')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Created</span>
                                {getSortIcon('createdAt')}
                            </div>
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => onSort('stats.clickStats.totalClicks')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Clicks</span>
                                {getSortIcon('stats.clickStats.totalClicks')}
                            </div>
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => onSort('stats.clickStats.lastClicked')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Last Clicked</span>
                                {getSortIcon('stats.clickStats.lastClicked')}
                            </div>
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {links.map((link) => (
                        <tr
                            key={link._id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => navigate(`/admin/links/${link._id}`)}
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <LinkIcon className="h-5 w-5 text-gray-400 mr-2" />
                                    <div className="text-sm font-medium text-gray-900">
                                        {link.shortCode}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 truncate max-w-xs">
                                    {link.originalUrl}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
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
                                {link.safetyStatus?.threatTypes?.length > 0 && (
                                    <div className="mt-1 flex items-center text-xs text-red-600">
                                        <FlagIcon className="h-3 w-3 mr-1" />
                                        {link.safetyStatus.threatTypes.join(', ')}
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {format(new Date(link.createdAt), 'PPP')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center text-sm text-gray-900">
                                    <CursorClickIcon className="h-4 w-4 mr-1 text-gray-400" />
                                    {link.stats.clickStats.totalClicks}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {link.stats.clickStats.lastClicked ? (
                                    <div className="flex items-center">
                                        <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                                        {formatDistanceToNow(new Date(link.stats.clickStats.lastClicked), {
                                            addSuffix: true,
                                        })}
                                    </div>
                                ) : (
                                    'Never'
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/admin/links/${link._id}`);
                                    }}
                                    className="text-blue-600 hover:text-blue-900"
                                >
                                    View Details
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Links = () => {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        safetyStatus: '',
        dateRange: '',
    });
    const [sortField, setSortField] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
    });

    const fetchLinks = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                sort: `${sortDirection === 'desc' ? '-' : ''}${sortField}`,
                ...filters,
            });

            const response = await axios.get(`/api/admin/links?${queryParams}`);
            setLinks(response.data.data.links);
            setPagination({
                ...pagination,
                total: response.data.data.total,
            });
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch links');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLinks();
    }, [pagination.page, pagination.limit, sortField, sortDirection, filters]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    };

    if (loading && !links.length) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Links Management</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            View and manage all shortened links
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => fetchLinks()}
                            className="p-2 text-gray-400 hover:text-gray-500"
                            title="Refresh"
                        >
                            <ArrowPathIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
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
                            placeholder="Search links..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="disabled">Disabled</option>
                        <option value="flagged">Flagged</option>
                    </select>
                    <select
                        name="safetyStatus"
                        value={filters.safetyStatus}
                        onChange={handleFilterChange}
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="">All Safety Statuses</option>
                        <option value="safe">Safe</option>
                        <option value="unsafe">Unsafe</option>
                        <option value="unknown">Unknown</option>
                    </select>
                    <select
                        name="dateRange"
                        value={filters.dateRange}
                        onChange={handleFilterChange}
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                    </select>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <FlagIcon className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Links Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <LinkTable
                    links={links}
                    onSort={handleSort}
                    sortField={sortField}
                    sortDirection={sortDirection}
                />
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
                <div className="flex-1 flex justify-between sm:hidden">
                    <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page * pagination.limit >= pagination.total}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            of <span className="font-medium">{pagination.total}</span> results
                        </p>
                    </div>
                    <div>
                        <nav
                            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                            aria-label="Pagination"
                        >
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="sr-only">Previous</span>
                                <svg
                                    className="h-5 w-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                            {Array.from(
                                { length: Math.ceil(pagination.total / pagination.limit) },
                                (_, i) => i + 1,
                            )
                                .filter(
                                    (page) =>
                                        page === 1 ||
                                        page === Math.ceil(pagination.total / pagination.limit) ||
                                        Math.abs(page - pagination.page) <= 2,
                                )
                                .map((page, index, array) => {
                                    if (
                                        index > 0 &&
                                        array[index - 1] !== page - 1
                                    ) {
                                        return (
                                            <React.Fragment key={`ellipsis-${page}`}>
                                                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                                    ...
                                                </span>
                                                <button
                                                    onClick={() => handlePageChange(page)}
                                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                                                        page === pagination.page
                                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                            : 'text-gray-500 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            </React.Fragment>
                                        );
                                    }
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                                                page === pagination.page
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                    : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page * pagination.limit >= pagination.total}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="sr-only">Next</span>
                                <svg
                                    className="h-5 w-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Links; 