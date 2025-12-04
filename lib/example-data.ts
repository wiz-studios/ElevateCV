/**
 * Example Data for Testing
 * Use these to test the API endpoints
 */

import type { Resume } from "@/src/types/resume"
import type { Job } from "@/src/types/job"

export const EXAMPLE_RESUME_TEXT = `
JOHN DOE
john.doe@email.com | (555) 123-4567 | San Francisco, CA

SUMMARY
Full-stack software engineer with 5+ years of experience building scalable web applications. 
Passionate about creating user-centric products and driving business impact through technology.

SKILLS
JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, PostgreSQL, MongoDB, GraphQL, Git, Agile

EXPERIENCE

Senior Software Engineer | TechCorp Inc. | Jan 2021 - Present
• Led development of customer-facing dashboard serving 50,000+ daily active users
• Implemented microservices architecture reducing deployment time by 40%
• Mentored team of 4 junior developers through code reviews and pair programming
• Built real-time notification system processing 1M+ events per day

Software Engineer | StartupXYZ | Jun 2018 - Dec 2020
• Developed React Native mobile app downloaded by over 100,000 users
• Optimized database queries improving API response time by 60%
• Integrated third-party payment system handling $2M+ annual transactions
• Collaborated with design team to improve UX increasing user retention

EDUCATION
Bachelor of Science in Computer Science | Stanford University | 2018

CERTIFICATIONS
AWS Solutions Architect - Associate
`

export const EXAMPLE_JOB_TEXT = `
Senior Full-Stack Engineer

About the Role:
We're looking for a Senior Full-Stack Engineer to join our growing team and help build 
the next generation of our platform. You'll work closely with product, design, and 
engineering teams to ship features that delight our users.

Responsibilities:
• Design and implement scalable backend services using Node.js and TypeScript
• Build responsive, accessible frontend interfaces with React and Next.js
• Collaborate with cross-functional teams to define product requirements
• Mentor junior engineers and conduct code reviews
• Participate in on-call rotations and incident response
• Contribute to architectural decisions and technical roadmap

Requirements:
• 5+ years of experience in full-stack development
• Strong proficiency in TypeScript, React, and Node.js
• Experience with cloud platforms (AWS, GCP, or Azure)
• Knowledge of database design and optimization (PostgreSQL, MongoDB)
• Excellent communication and collaboration skills
• Experience with CI/CD pipelines and DevOps practices

Nice to Have:
• Experience with Kubernetes and container orchestration
• Background in building real-time systems
• Contributions to open source projects
• Experience with GraphQL
`

export const EXAMPLE_RESUME_JSON: Resume = {
  name: "John Doe",
  email: "john.doe@email.com",
  phone: "(555) 123-4567",
  summary:
    "Full-stack software engineer with 5+ years of experience building scalable web applications. Passionate about creating user-centric products and driving business impact through technology.",
  sections: ["Summary", "Skills", "Experience", "Education", "Certifications"],
  skills: [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Python",
    "AWS",
    "Docker",
    "PostgreSQL",
    "MongoDB",
    "GraphQL",
    "Git",
    "Agile",
  ],
  bullets: [
    {
      id: "bullet-1",
      section: "Experience",
      company: "TechCorp Inc.",
      start_date: "Jan 2021",
      end_date: "Present",
      raw_text: "Led development of customer-facing dashboard serving 50,000+ daily active users",
      action: "led",
      metric_value: 50000,
      metric_unit: "users",
    },
    {
      id: "bullet-2",
      section: "Experience",
      company: "TechCorp Inc.",
      raw_text: "Implemented microservices architecture reducing deployment time by 40%",
      action: "implemented",
      metric_value: 40,
      metric_unit: "%",
    },
    {
      id: "bullet-3",
      section: "Experience",
      company: "TechCorp Inc.",
      raw_text: "Mentored team of 4 junior developers through code reviews and pair programming",
      action: "mentored",
      metric_value: 4,
      metric_unit: "developers",
    },
    {
      id: "bullet-4",
      section: "Experience",
      company: "StartupXYZ",
      start_date: "Jun 2018",
      end_date: "Dec 2020",
      raw_text: "Developed React Native mobile app downloaded by over 100,000 users",
      action: "developed",
      metric_value: 100000,
      metric_unit: "users",
    },
  ],
}

export const EXAMPLE_JOB_JSON: Job = {
  title: "Senior Full-Stack Engineer",
  seniority: "Senior",
  keywords: [
    "TypeScript",
    "React",
    "Node.js",
    "Next.js",
    "AWS",
    "PostgreSQL",
    "MongoDB",
    "Kubernetes",
    "GraphQL",
    "CI/CD",
  ],
  responsibilities: [
    "Design and implement scalable backend services using Node.js and TypeScript",
    "Build responsive, accessible frontend interfaces with React and Next.js",
    "Collaborate with cross-functional teams to define product requirements",
    "Mentor junior engineers and conduct code reviews",
    "Participate in on-call rotations and incident response",
    "Contribute to architectural decisions and technical roadmap",
  ],
}
