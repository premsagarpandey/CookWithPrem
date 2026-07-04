"use client";

// ============================================
// CookWithPrem — Admin Users Management
// ============================================

import { useEffect, useState } from "react";
import { Shield, ShieldAlert, Mail } from "lucide-react";
import { getAllUsers, updateUserRole } from "@/lib/firebase/firestore";
import type { UserProfile } from "@/types";
import { timeAgo } from "@/lib/utils";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (uid: string, currentRole: string) => {
    if (!confirm(`Change this user's role?`)) return;
    try {
      const newRole = currentRole === "admin" ? "user" : "admin";
      await updateUserRole(uid, newRole);
      setUsers(users.map((u) => (u.uid === uid ? { ...u, role: newRole } : u)));
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Manage Users
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Total Users: {users.length}
        </p>
      </div>

      <div className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-muted">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-light bg-cream/50">
                  <th className="text-left p-4 font-medium text-text-secondary">User</th>
                  <th className="text-left p-4 font-medium text-text-secondary">Joined</th>
                  <th className="text-left p-4 font-medium text-text-secondary">Role</th>
                  <th className="text-right p-4 font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.uid}
                    className="border-b border-border-light hover:bg-cream/30"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-beige flex items-center justify-center font-bold text-warm-brown shrink-0">
                          {user.displayName?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">
                            {user.displayName || "Anonymous User"}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-text-muted">
                            <Mail size={12} />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-text-secondary">
                      {user.createdAt
                        ? timeAgo(user.createdAt.toDate())
                        : "Unknown"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          user.role === "admin"
                            ? "bg-sage/20 text-sage-dark"
                            : "bg-beige text-text-secondary"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => handleRoleToggle(user.uid, user.role)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-border-light hover:bg-beige transition-colors"
                        >
                          {user.role === "admin" ? (
                            <><ShieldAlert size={14} className="text-error" /> Remove Admin</>
                          ) : (
                            <><Shield size={14} className="text-sage-dark" /> Make Admin</>
                          )}
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
