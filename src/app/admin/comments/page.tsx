"use client";

// ============================================
// CookWithPrem — Admin Comments Management
// ============================================

import { useEffect, useState } from "react";
import { Trash2, MessageCircle } from "lucide-react";
import { getAllComments, deleteComment } from "@/lib/firebase/firestore";
import type { Comment } from "@/types";
import { timeAgo } from "@/lib/utils";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await getAllComments();
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteComment(id);
      setComments(comments.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Manage Comments
        </h1>
      </div>

      <div className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-muted">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="p-8 text-center text-text-muted">No comments yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-light bg-cream/50">
                  <th className="text-left p-4 font-medium text-text-secondary">Author</th>
                  <th className="text-left p-4 font-medium text-text-secondary">Comment</th>
                  <th className="text-left p-4 font-medium text-text-secondary">Date</th>
                  <th className="text-right p-4 font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {comments.map((comment) => (
                  <tr
                    key={comment.id}
                    className="border-b border-border-light hover:bg-cream/30"
                  >
                    <td className="p-4 whitespace-nowrap">
                      <div className="font-medium text-text-primary">
                        {comment.userName}
                      </div>
                    </td>
                    <td className="p-4 min-w-[300px]">
                      <div className="flex items-start gap-2">
                        <MessageCircle size={16} className="text-text-muted mt-0.5 shrink-0" />
                        <p className="text-text-secondary line-clamp-2">
                          {comment.text}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-text-secondary">
                      {comment.createdAt
                        ? timeAgo(comment.createdAt.toDate())
                        : "Just now"}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="p-2 text-text-muted hover:text-error rounded-[var(--radius-sm)] hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
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
