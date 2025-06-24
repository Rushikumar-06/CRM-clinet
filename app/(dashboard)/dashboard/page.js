'use client';

import { useEffect, useState } from 'react';
import { getFirebaseIdToken } from '@/lib/firebaseAuth';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00c49f'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [contactsByCompany, setContactsByCompany] = useState([]);
  const [activityTimeline, setActivityTimeline] = useState([]);
  const [tagDistribution, setTagDistribution] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = await getFirebaseIdToken();
        const fetchWithAuth = async (url) => {
          const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
          if (!res.ok) throw new Error(`Failed to fetch ${url}`);
          return await res.json();
        };

        const [summaryRes, companyRes, timelineRes, tagRes] = await Promise.all([
          fetchWithAuth('http://localhost:5000/api/dashboard/summary'),
          fetchWithAuth('http://localhost:5000/api/dashboard/contacts-by-company'),
          fetchWithAuth('http://localhost:5000/api/dashboard/activities-timeline'),
          fetchWithAuth('http://localhost:5000/api/dashboard/tag-distribution'),
        ]);

        setSummary(summaryRes);
        setContactsByCompany(companyRes.map(item => ({ company: item._id || 'Unknown', count: item.count })));
        setActivityTimeline(timelineRes.map(item => ({ date: item._id, count: item.count })));
        setTagDistribution(tagRes.map(item => ({ tag: item._id, count: item.count })));
        setError(null);
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Failed to load dashboard data.');
      }
    };
    if (user) fetchAll();
  }, [user]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm">Total Contacts</p><p className="text-2xl font-bold">{summary?.totalContacts ?? '0'}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm">New This Week</p><p className="text-2xl font-bold">{summary?.newThisWeek ?? '0'}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm">Total Activities</p><p className="text-2xl font-bold">{summary?.totalActivities ?? '0'}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm">Active Tags</p><p className="text-2xl font-bold">{summary?.activeTags ?? '0'}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-2">Contacts by Company</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contactsByCompany} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="company" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-2">Activity Timeline</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#82ca9d" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-2">Tag Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={tagDistribution} dataKey="count" nameKey="tag" outerRadius={100} label>
                  {tagDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
