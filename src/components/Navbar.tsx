"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getNotifications, markAllNotificationsRead } from "@/services/notification.service";

interface Notification {
  id: string;
  is_read: boolean;
  message: string;
  type: string;
}

export default function Navbar() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data: Notification[] = await getNotifications();
        setNotifications(data);
        const unread = data.filter((n: Notification) => !n.is_read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error(error);
      }
    }
    load();
  }, []);

  return (
    <nav className="h-16 border-b bg-white flex items-center justify-between px-6">
      <Link href="/" className="text-xl font-bold text-orange-500">
        Antyl
      </Link>

      <div className="flex items-center gap-6">
        <Link href="/dashboard">Dashboard</Link>

        <Link href="/jobs">Jobs</Link>

        <Link href="/pipeline">Pipeline</Link>
        <Link href="/settings">
  Settings
</Link>
        <div className="relative">
          <button className="text-xl relative" onClick={() => setOpen(!open)}>
            🔔
          </button>

          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}

          {open && (
            <div className="absolute right-0 top-10 w-80 bg-white border rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <span className="font-semibold">Notifications</span>

                <button
                  className="text-sm text-orange-500"
                  onClick={async () => {
                    try {
                      await markAllNotificationsRead();
                      setNotifications((prev) =>
                        prev.map((notification) => ({
                          ...notification,
                          is_read: true,
                        }))
                      );
                      setUnreadCount(0);
                    } catch (error) {
                      console.error(error);
                    }
                  }}
                >
                  Mark All Read
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="p-4 text-gray-500">No notifications</div>
              ) : (
                notifications.map((notification: Notification) => (
                  <div key={notification.id} className="p-4 border-b">
                    <div>{notification.message}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {notification.type}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}