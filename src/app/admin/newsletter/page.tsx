"use client";

// ============================================
// CookWithPrem — Admin Newsletter Management
// ============================================

import { useEffect, useState } from "react";
import { Mail, Download } from "lucide-react";
import { getNewsletterSubscribers } from "@/lib/firebase/firestore";
import type { NewsletterSubscriber } from "@/types";
import { formatDateTime } from "@/lib/utils";

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const data = await getNewsletterSubscribers();
      setSubscribers(data);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Email,Date Subscribed\n" +
      subscribers
        .map(
          (s) =>
            `${s.email},${
              s.createdAt ? formatDateTime(s.createdAt.toDate()) : "Unknown"
            }`
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cookwithprem_subscribers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            Newsletter Subscribers
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Total Subscribers: {subscribers.length}
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={subscribers.length === 0}
          className="btn-secondary text-sm disabled:opacity-50"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-muted">Loading subscribers...</div>
        ) : subscribers.length === 0 ? (
          <div className="p-8 text-center text-text-muted">No subscribers yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-light bg-cream/50">
                  <th className="text-left p-4 font-medium text-text-secondary">Email Address</th>
                  <th className="text-left p-4 font-medium text-text-secondary">Date Subscribed</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-border-light hover:bg-cream/30"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-medium text-text-primary">
                        <Mail size={16} className="text-text-muted" />
                        {sub.email}
                      </div>
                    </td>
                    <td className="p-4 text-text-secondary">
                      {sub.createdAt
                        ? formatDateTime(sub.createdAt.toDate(), true)
                        : "Unknown"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
