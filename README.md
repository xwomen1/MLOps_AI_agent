# 🌐 DevOps AI Cloud Assistant

**DevOps AI Cloud Assistant** is a full-stack AI platform designed to help DevOps engineers and cloud practitioners analyze deployment logs, optimize infrastructure, and interact with AI in real-time. 

Built with a **Next.js frontend** and **Python serverless backend**, this project demonstrates how to deploy AI solutions on **AWS, GCP, Azure, and Vercel** using **MLOps, Bedrock, SageMaker, RAG, and MCP** principles.

---

## 📺 Video Demo

[![Watch the Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

> *Tip: To display a local video, drag and drop your MP4 file here when editing on GitHub, or replace the link above with your YouTube/Loom URL.*

---

## 🎯 Project Goals

* **AI-Driven Analytics:** Apply LLMs to parse complex deployment logs and cloud configurations.
* **RAG Integration:** Implement Retrieval-Augmented Generation for fetching context from internal docs or wikis.
* **Automated Response:** Use Agents & MCP (Model Context Protocol) for incident response and remediation.
* **MLOps Best Practices:** Demonstrate model deployment, inference, and observability in a multi-cloud environment.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 15+, Tailwind CSS, Clerk (Authentication) |
| **Backend** | Python (FastAPI) Serverless on Vercel |
| **AI Models** | Gemini Pro / OpenAI GPT-4o |
| **Streaming** | Server-Sent Events (SSE) for real-time chat |
| **Cloud (AWS)** | SageMaker, Bedrock, Lambda, CloudWatch |
| **Cloud (GCP)** | Vertex AI, Cloud Run, Cloud Logging |
| **Cloud (Azure)** | ML Studio, Azure Functions |

---

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone [https://github.com/username/devops-ai.git](https://github.com/username/devops-ai.git)
cd devops-ai
```
2. Install Dependencies
```bash
npm install
``` 
3. Configure Environment Variables
Create a .env.local file in the root directory:
Code snippet
```bash
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
CLERK_JWKS_URL=your_clerk_jwks_url
```
4. Deploy to Vercel

```bash
vercel --prod
```
💬 Key Features
Live AI Chat: Real-time streaming for troubleshooting deployment issues and cloud optimization.

Professional Summaries: Automated log analysis with actionable insights.

Draft Emails: Generate professional, stakeholder-ready emails from AI-detected incidents.

Multi-Cloud Guidance: Deployment playbooks for AWS, GCP, and Azure.

Scalable Architecture: Fully serverless and observable via MCP.

📚 Learning & Academic Use
Explore the intersection of AI and Infrastructure:

RAG + AI Agents: Learn how to bridge the gap between static docs and live logs.

Serverless Python: Master SSE (Server-Sent Events) for real-time AI interactions.

Multi-Cloud MLOps: Understand how to manage AI workloads across different cloud ecosystems.

📄 License
This project is licensed under the MIT License. See the [LICENSE](https://github.com/xwomen1/MLOps_AI_agent/edit/master/LICENSE.md) file for the full text.

⭐ Support
If you find this project useful, please give it a ⭐! Feedback and issues are always welcome.

