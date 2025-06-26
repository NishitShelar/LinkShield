import React from 'react';
import Link from 'next/link';

const AdminIndex = () => (
  <div className="p-8 max-w-xl mx-auto">
    <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
    <ul className="space-y-4">
      <li>
        <Link href="/pages/admin/Feedback" className="text-blue-600 underline hover:text-blue-800">View Feedback</Link>
      </li>
      {/* Add more admin links here as needed */}
    </ul>
  </div>
);

export default AdminIndex; 