"use client";

// ============================================
// CookWithPrem — Admin Messages Management
// ============================================

import { useEffect, useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { getContactMessages, markMessageAsRead } from "@/lib/firebase/firestore";
import type { ContactMessage } from "@/types";
import { timeAgo } from "@/lib/utils";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await getContactMessages();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markMessageAsRead(id);
      setMessages(messages.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Contact Messages
        </h1>
      </div>

      <div className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-muted">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-text-muted">No messages yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-light bg-cream/50">
                  <th className="text-left p-4 font-medium text-text-secondary">Sender</th>
                  <th className="text-left p-4 font-medium text-text-secondary">Message</th>
                  <th className="text-left p-4 font-medium text-text-secondary">Date</th>
                  <th className="text-right p-4 font-medium text-text-secondary">Status</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr
                    key={msg.id}
                    className={`border-b border-border-light hover:bg-cream/30 ${
                      !msg.isRead ? "bg-amber-50/30" : ""
                    }`}
                  >
                    <td className="p-4 whitespace-nowrap">
                      <div className="font-medium text-text-primary">{msg.name}</div>
                      <div className="flex items-center gap-1 text-xs text-text-muted">
                        <Mail size={12} />
                        {msg.email}
                      </div>
                    </td>
                    <td className="p-4 min-w-[300px]">
                      <p className="font-medium text-text-primary mb-1">
                        {msg.subject}
                      </p>
                      <p className="text-text-secondary text-sm">
                        {msg.message}
                      </p>
                    </td>
                    <td className="p-4 whitespace-nowrap text-text-secondary">
                      {msg.createdAt
                        ? timeAgo(msg.createdAt.toDate())
                        : "Just now"}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center justify-end">
                        {!msg.isRead ? (
                          <button
                            onClick={() => handleMarkAsRead(msg.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-border-light hover:bg-beige transition-colors text-warm-brown"
                          >
                            <CheckCircle2 size={14} />
                            Mark Read
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-text-muted">
                            <CheckCircle2 size={14} />
                            Read
                          </span>
                        )}
                      </div>
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
