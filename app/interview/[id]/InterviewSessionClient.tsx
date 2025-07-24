"use client";

import React from "react";
import GeminiInterviewComponent from "@/components/ui/GeminiInterviewComponent";

interface Interview {
  id: string;
  name?: string;
  education?: string;
  experience?: string;
  company_name?: string;
  companyName?: string;
  role: string;
  job_description?: string;
  jobDescription?: string;
  interview_focus?: string;
  interviewFocus?: string;
  questions?: string[];
}

interface InterviewSessionClientProps {
  interview: Interview;
}

const InterviewSessionClient = ({ interview }: InterviewSessionClientProps) => {
  return (
    <GeminiInterviewComponent
      interviewId={interview.id}
      name={interview.name}
      experience={interview.experience}
      companyName={interview.company_name || interview.companyName}
      role={interview.role}
      jobDescription={interview.job_description || interview.jobDescription}
      interviewFocus={interview.interview_focus || interview.interviewFocus}
    />
  );
};

export default InterviewSessionClient;
