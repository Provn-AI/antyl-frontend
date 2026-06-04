"use client";

import { useEffect, useState } from "react";

import {
  getAutoApplyLog,
  withdrawApplication,
} from "@/services/application.service";

interface Application {
  id: string;
  job_title: string;
  similarity_score: number;
  status: string;
  applied_at: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] =
    useState<Application[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data =
          await getAutoApplyLog();

        if (mounted) {
          setApplications(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleWithdraw = async (
    applicationId: string
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to withdraw this application?"
    );

    if (!confirmed) return;

    try {
      await withdrawApplication(
        applicationId
      );

      setApplications((prev) =>
        prev.filter(
          (app) =>
            app.id !== applicationId
        )
      );

      alert(
        "Application withdrawn successfully."
      );
    } catch (error) {
      console.error(error);

      alert(
        "Failed to withdraw application."
      );
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        Loading applications...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        Auto Apply Activity
      </h1>

      {applications.length === 0 ? (
        <div className="border rounded-lg p-6">
          No auto applications found.
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="border rounded-lg p-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-lg">
                    {app.job_title}
                  </h2>

                  <p className="text-gray-500 text-sm">
                    Applied{" "}
                    {new Date(
                      app.applied_at
                    ).toLocaleString()}
                  </p>

                  <p className="mt-2">
                    Similarity Score:
                    <span className="font-semibold ml-2">
                      {app.similarity_score}%
                    </span>
                  </p>

                  <p className="mt-1">
                    Status:
                    <span className="font-semibold ml-2">
                      {app.status}
                    </span>
                  </p>
                </div>

                {(app.status === "sent" ||
                  app.status ===
                    "viewed") && (
                  <button
                    onClick={() =>
                      handleWithdraw(
                        app.id
                      )
                    }
                    className="px-4 py-2 rounded bg-red-600 text-white"
                  >
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}