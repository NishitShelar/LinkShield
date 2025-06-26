import React, { useEffect, useState } from 'react';

const FeedbackAdmin = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      const res = await fetch('/api/admin/feedback');
      const data = await res.json();
      setFeedbacks(data.data || []);
      setLoading(false);
    };
    fetchFeedbacks();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Feedback</h1>
      {loading ? (
        <div>Loading...</div>
      ) : feedbacks.length === 0 ? (
        <div>No feedback yet.</div>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Message</th>
              <th className="py-2 px-4 border-b">User</th>
              <th className="py-2 px-4 border-b">Date</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map(fb => (
              <tr key={fb._id}>
                <td className="py-2 px-4 border-b">{fb.message}</td>
                <td className="py-2 px-4 border-b">{fb.user ? `${fb.user.name} (${fb.user.email})` : 'Anonymous'}</td>
                <td className="py-2 px-4 border-b">{new Date(fb.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FeedbackAdmin; 