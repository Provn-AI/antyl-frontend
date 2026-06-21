"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [notificationPreferences, setNotificationPreferences] = useState({
    profileViewed: true,
    matchReceived: true,
    interviewScheduled: true,
  });

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Account Settings</h2>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded p-3"
          />

          <input
            type="password"
            placeholder="New Password"
            className="w-full border rounded p-3"
          />

          <button className="px-5 py-3 bg-orange-500 text-white rounded">
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>

        <div className="space-y-4">
          <label className="flex justify-between items-center">
            <span>Profile Viewed</span>
            <input
              type="checkbox"
              checked={notificationPreferences.profileViewed}
              onChange={(e) =>
                setNotificationPreferences({
                  ...notificationPreferences,
                  profileViewed: e.target.checked,
                })
              }
            />
          </label>

          <label className="flex justify-between items-center">
            <span>Match Received</span>
            <input
              type="checkbox"
              checked={notificationPreferences.matchReceived}
              onChange={(e) =>
                setNotificationPreferences({
                  ...notificationPreferences,
                  matchReceived: e.target.checked,
                })
              }
            />
          </label>

          <label className="flex justify-between items-center">
            <span>Interview Scheduled</span>
            <input
              type="checkbox"
              checked={notificationPreferences.interviewScheduled}
              onChange={(e) =>
                setNotificationPreferences({
                  ...notificationPreferences,
                  interviewScheduled: e.target.checked,
                })
              }
            />
          </label>
        </div>
      </div>
    </div>
  );
}