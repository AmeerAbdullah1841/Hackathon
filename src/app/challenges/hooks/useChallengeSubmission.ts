"use client";

import { useCallback, useEffect, useState } from "react";

type SubmissionData = {
  plan?: string;
  findings?: string;
  flag?: string;
  [key: string]: string | undefined;
};

export function useChallengeSubmission(
  teamId: string | null,
  assignmentId: string | null,
) {
  const [submissionData, setSubmissionData] = useState<SubmissionData>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing submission if available
  useEffect(() => {
    if (!assignmentId) return;

    const loadSubmission = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/submissions?assignmentId=${assignmentId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.submission) {
            setSubmissionData({
              plan: data.submission.plan || "",
              findings: data.submission.findings || "",
              flag: data.submission.flag || "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to load submission:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubmission();
  }, [assignmentId]);

  const updateSubmissionData = useCallback((field: string, value: string) => {
    setSubmissionData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const saveSubmission = useCallback(async (customData?: SubmissionData) => {
    if (!teamId || !assignmentId) {
      setSaveMessage("Team or assignment information missing");
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const dataToSave = customData || submissionData;
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          teamId,
          plan: dataToSave.plan || "",
          findings: dataToSave.findings || "",
          flag: dataToSave.flag || "",
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || "Failed to save submission");
      }

      setSaveMessage("Submission saved successfully!");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage(
        error instanceof Error ? error.message : "Failed to save submission",
      );
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsSaving(false);
    }
  }, [teamId, assignmentId, submissionData]);

  return {
    submissionData,
    updateSubmissionData,
    saveSubmission,
    isSaving,
    saveMessage,
    isLoading,
  };
}

