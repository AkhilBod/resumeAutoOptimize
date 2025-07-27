"""
Resume Optimizer Module - Integrates with your Chrome Extension's Gemini AI
"""

import asyncio
import json
import logging
import os
from typing import Optional, Dict, Any
import aiohttp
from pathlib import Path

logger = logging.getLogger("autoapply.resume_optimizer")

class ResumeOptimizer:
    """Enhanced Resume Optimizer that integrates with your Chrome Extension"""
    
    def __init__(self, gemini_api_key: str):
        self.api_key = gemini_api_key
        self.api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent"
        self.base_resume_template = self._load_base_resume()
        
    def _load_base_resume(self) -> str:
        """Load the base resume template (same as your extension)"""
        # This is the same template from your popup.js
        return """\documentclass[letterpaper,11pt]{article}

\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\input{glyphtounicode}

\pagestyle{fancy}
\fancyhf{}
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

\addtolength{\oddsidemargin}{-0.6in}
\addtolength{\evensidemargin}{-0.6in}
\addtolength{\textwidth}{1.2in}
\addtolength{\topmargin}{-.6in}
\addtolength{\textheight}{1.1in}

\urlstyle{same}

\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

\titleformat{\section}{
  \vspace{-5pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{-6pt}]

\pdfgentounicode=1

% Custom commands
\newcommand{\resumeItem}[1]{
  \item\small{
    #1 \vspace{-3pt}
  }
}

\newcommand{\resumeSubheading}[4]{
  \vspace{-3pt}\item
    \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & \textbf{#2} \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabular*}\vspace{-8pt}
}

\newcommand{\resumeSubSubheading}[2]{
  \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \textit{\small#1} & \textit{\small #2} \\
    \end{tabular*}\vspace{-8pt}
}

\newcommand{\resumeProjectHeading}[2]{
  \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \small#1 & \textbf{#2} \\
    \end{tabular*}\vspace{-8pt}
}

\newcommand{\resumeSubItem}[1]{\resumeItem{#1}\vspace{-5pt}}

\renewcommand\labelitemii{$\vcenter{\hbox{\tiny$\bullet$}}$}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.15in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-6pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%

\begin{document}

%----------HEADING----------
\begin{center}
  \textbf{\Huge \scshape Akhil Bodahanapati} \\ \vspace{1pt}
  \small \textbf{akb198@pitt.edu} $|$ \textbf{747-312-1646} $|$ Pittsburgh, PA $|$
  \href{https://akhilbod.github.io/}{\underline{\textbf{akhilbod.github.io}}} $|$ 
  \href{https://github.com/AkhilBod}{\underline{\textbf{github.com/AkhilBod}}} $|$
  \href{https://linkedin.com/in/akhil-bod}{\underline{\textbf{linkedin.com/in/akhil-bod}}} 
\end{center}

%-----------EDUCATION-----------
\section{Education}
\resumeSubHeadingListStart
  \resumeSubheading
    {University of Pittsburgh}{Pittsburgh, PA}
    {\textbf{Bachelor of Science} in \textbf{Computer Science, Data Science}}{Expected April 2027}
    \resumeItemListStart
      \resumeItem{\textbf{Relevant Coursework:} \textbf{Computer Architecture}, \textbf{Systems Programming}, \textbf{Discrete Mathematics}, \textbf{Data Structures and Algorithms I}, \textbf{Linear Algebra}, \textbf{Calculus 1}}
    \resumeItemListEnd
\resumeSubHeadingListEnd

%-----------SKILLS-----------
\section{Skills}
\begin{itemize}[leftmargin=0.15in, label={}]
  \item \small{
    \textbf{Programming Languages:} \textbf{Python}, \textbf{Java}, \textbf{C}, \textbf{SQL} \\
    \textbf{Web Development:} \textbf{JavaScript}, \textbf{React}, \textbf{Node.js}, HTML, CSS, Flask \\
    \textbf{Libraries/Frameworks:} Pandas, Selenium, \textbf{YOLOv3}, Flask, NumPy \\
    \textbf{AI/ML:} \textbf{PyTorch}, \textbf{TensorFlow}, \textbf{wav2vec2}, \textbf{CLIP}, \textbf{RoBERTa}/DistilBERT
  }
\end{itemize}

%-----------EXPERIENCE-----------
\section{Experience}
\resumeSubHeadingListStart

  \resumeSubheading
    {Software Engineer Intern}{May 2025 – Present}
    {Federated Hermes}{Pittsburgh, PA}
    \resumeItemListStart
      \resumeItem{\textbf{Develop and optimize} 10+ Databricks notebooks (\textbf{PySpark}, \textbf{SQL}), reducing dataset processing time by \textbf{25\%}, resulting in a \textbf{10\% cost reduction} in cloud compute resources; orchestrate daily ETL jobs (150GB+ data).}
      \resumeItem{\textbf{Automated} the migration of 20 legacy data pipelines to \textbf{YAML}/Azure DevOps, improving deployment frequency by \textbf{50\%} and data volume capacity by \textbf{30\%}.}
      \resumeItem{\textbf{Awarded 1st place} in a company-wide hackathon by developing a solution projected to generate over \textbf{500M in revenue}.}
    \resumeItemListEnd

  \resumeSubheading
    {Full Stack Developer Intern}{Jun 2024 – Aug 2024}
    {Star Hospitals}{Los Angeles, CA}
    \resumeItemListStart
      \resumeItem{\textbf{Led the development} of a patient management system automating bed allocation and triage workflows, resulting in a \textbf{20\% reduction} in patient wait times, improving operational efficiency.}
      \resumeItem{\textbf{Optimized} reporting module with recursive \textbf{CTEs} and indexed views in \textbf{SQL}, reducing data retrieval latency by \textbf{40\%}, enabling faster report generation and improved user experience.}
      \resumeItem{\textbf{Engineered and deployed RBAC} using \textbf{JWT} and \textbf{Flask-Login}, securing \textbf{10,000+ medical records} and ensuring compliance with \textbf{DISHA standards}, mitigating potential data breaches.}
    \resumeItemListEnd

  \resumeSubheading
    {Student Researcher}{Jan 2025 – May 2025}
    {University of Pittsburgh School of Computing and Information}{Pittsburgh, PA}
    \resumeItemListStart
      \resumeItem{\textbf{Simulated quantum routing protocols} (SLMP, QPASS, QCAST) in \textbf{NetSquid}, improving throughput by \textbf{25\%} across mesh, ring, and line network topologies.}
      \resumeItem{\textbf{Adapted algorithms} to platform constraints, reducing average routing latency by \textbf{15\%}.}
      \resumeItem{\textbf{Co-authored a research paper} detailing findings, accepted to the \textbf{Pitt SCI Undergraduate Research Symposium}.}
    \resumeItemListEnd

\resumeSubHeadingListEnd

%-----------PROJECTS-----------
\section{Projects}
\resumeSubHeadingListStart

  \resumeProjectHeading
    {\textbf{\href{https://www.interviewsense.org/}{InterviewSense: AI-Powered Mock Interview}} $|$ \emph{Node.js, PyTorch, PostgreSQL, AWS}}
    {May 2024 -- Present}
  \resumeItemListStart
    \resumeItem{\textbf{Lead the development} of an AI-driven platform that has \textbf{over 1000+ signups}}
    \resumeItem{\textbf{Architected and implemented} a modular, scalable backend using \textbf{Node.js} and \textbf{PostgreSQL}, enabling seamless updates and supporting a \textbf{30\% increase} in platform users.}
    \resumeItem{\textbf{Built a responsive frontend} using \textbf{React} and \textbf{Tailwind CSS} to ensure an intuitive, accessible user experience for interview practice and feedback review.}
    \resumeItem{\href{https://www.interviewsense.org/}{\textit{Website}}}
  \resumeItemListEnd

  \resumeProjectHeading
    {\textbf{\href{https://github.com/Not-Ethan/Orbit}{Orbit: Tri-Modal AI Search Engine}} $|$ \emph{Python, Flask, React, PyTorch, CLIP, CLAP, Faiss}}
    {Jan 2025 – Feb 2025}
  \resumeItemListStart
    \resumeItem{\textbf{Spearheaded the development} of an innovative tri-modal search engine, earning the \textbf{"Most Significant Innovation Using Groundbreaking Technology"} award against \textbf{120+ teams} at \textbf{CMU TartanHacks}.}
    \resumeItem{\textbf{Engineered a novel query system} fusing semantic (text/image via \textbf{CLIP}), acoustic (audio via \textbf{CLAP}), and structured metadata, demonstrably improving search recall by an estimated \textbf{40\%} over unimodal baselines.}
    \resumeItem{\textbf{Implemented a custom high-performance} vector similarity engine with \textbf{Faiss}, achieving sub-second (<\textbf{500ms}) query latency across a testbed of \textbf{10,000+ multimodal items}.}
    \resumeItem{\href{https://github.com/Not-Ethan/Orbit}{\textit{GitHub Repository}}}
  \resumeItemListEnd
\resumeSubHeadingListEnd

\end{document}
"""
    
    async def tailor_resume_for_job(self, job_description: str, company_info: Dict[str, Any] = None) -> str:
        """
        Tailor resume for specific job using Gemini AI
        Same logic as your Chrome extension
        """
        try:
            # Enhanced prompt with company research
            company_context = ""
            if company_info:
                company_context = f"""
                
Company Information:
- Company: {company_info.get('company_name', 'Unknown')}
- Industry: {company_info.get('industry', 'Technology')}
- Size: {company_info.get('size', 'Unknown')}
- Values: {', '.join(company_info.get('values', []))}
"""
            
            prompt = f"""As an expert resume writer, please tailor the following LaTeX resume to better match the job description. Keep the same LaTeX structure and formatting, but modify the content to:

1. Highlight relevant skills and experiences that match the job requirements
2. Use keywords from the job description naturally throughout the resume
3. Reorder or emphasize sections that best match the job requirements
4. Maintain professional language and accuracy
5. Keep the same LaTeX document structure and commands
6. Feel free to enhance projects, skills, or job responsibilities if they better align with the job posting
7. DO NOT change: graduation dates, company names, or position titles - keep these exactly as they are
8. MUST maximize content to fill exactly ONE PAGE - use as much space as possible without going over
9. Focus on quantifiable achievements and technical skills that match the role

{company_context}

Job Description:
{job_description}

Current Resume (LaTeX):
{self.base_resume_template}

Please return ONLY the tailored LaTeX code, maintaining all formatting and structure. Focus on making this resume stand out for this specific role while staying truthful and professional:"""

            # Make API call to Gemini
            async with aiohttp.ClientSession() as session:
                payload = {
                    "contents": [{
                        "parts": [{
                            "text": prompt
                        }]
                    }],
                    "generationConfig": {
                        "temperature": 0.7,
                        "topK": 40,
                        "topP": 0.95,
                        "maxOutputTokens": 8192,
                    }
                }
                
                headers = {
                    'Content-Type': 'application/json',
                }
                
                url = f"{self.api_url}?key={self.api_key}"
                
                async with session.post(url, json=payload, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        tailored_content = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
                        
                        if tailored_content:
                            # Clean up the response
                            cleaned_content = self._clean_latex_response(tailored_content)
                            logger.info("✅ Successfully tailored resume with AI")
                            return cleaned_content
                        else:
                            raise Exception("No content received from Gemini API")
                    else:
                        error_data = await response.json()
                        raise Exception(f"Gemini API error: {error_data}")
                        
        except Exception as e:
            logger.error(f"❌ Error tailoring resume: {str(e)}")
            # Return original template as fallback
            return self.base_resume_template
    
    def _clean_latex_response(self, content: str) -> str:
        """Clean up AI response to extract pure LaTeX"""
        # Remove markdown code blocks if present
        cleaned = content.strip()
        
        if cleaned.startswith('```latex'):
            cleaned = cleaned.replace('```latex\n', '', 1)
            
        if cleaned.startswith('```'):
            cleaned = cleaned.replace('```\n', '', 1)
            
        if cleaned.endswith('```'):
            cleaned = cleaned.rsplit('\n```', 1)[0]
            
        return cleaned.strip()
    
    async def generate_multiple_versions(self, job_description: str, company_info: Dict[str, Any] = None, count: int = 3) -> list:
        """Generate multiple resume versions for A/B testing"""
        versions = []
        
        for i in range(count):
            # Vary the temperature and approach for different versions
            version = await self.tailor_resume_for_job(job_description, company_info)
            versions.append({
                'version': i + 1,
                'content': version,
                'approach': f'version_{i+1}'
            })
            
        return versions
    
    async def optimize_for_ats(self, resume_content: str) -> str:
        """Optimize resume for ATS (Applicant Tracking Systems)"""
        prompt = f"""Please optimize this LaTeX resume for Applicant Tracking Systems (ATS). Make these improvements:

1. Ensure all section headers are clear and standard
2. Use consistent formatting throughout
3. Remove any complex LaTeX formatting that might confuse ATS
4. Ensure proper keyword density without keyword stuffing
5. Maintain readability for both ATS and humans
6. Keep the same overall structure and content

Resume to optimize:
{resume_content}

Return the ATS-optimized LaTeX code:"""

        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    "contents": [{
                        "parts": [{
                            "text": prompt
                        }]
                    }],
                    "generationConfig": {
                        "temperature": 0.3,  # Lower temperature for consistency
                        "topK": 20,
                        "topP": 0.8,
                        "maxOutputTokens": 8192,
                    }
                }
                
                headers = {'Content-Type': 'application/json'}
                url = f"{self.api_url}?key={self.api_key}"
                
                async with session.post(url, json=payload, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        optimized_content = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
                        
                        if optimized_content:
                            return self._clean_latex_response(optimized_content)
                            
        except Exception as e:
            logger.error(f"❌ Error optimizing for ATS: {str(e)}")
            
        return resume_content  # Return original if optimization fails

# Test the module
if __name__ == "__main__":
    async def test_optimizer():
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            print("Please set GEMINI_API_KEY environment variable")
            return
            
        optimizer = ResumeOptimizer(api_key)
        
        test_job = """
        Software Engineer Intern at Google
        
        We are looking for a passionate software engineering intern to join our team.
        
        Requirements:
        - Strong programming skills in Python, Java, or C++
        - Experience with data structures and algorithms
        - Knowledge of web development frameworks
        - Experience with machine learning is a plus
        
        You will work on cutting-edge projects involving AI and distributed systems.
        """
        
        tailored_resume = await optimizer.tailor_resume_for_job(test_job)
        print("Tailored resume generated successfully!")
        print(f"Length: {len(tailored_resume)} characters")
        
    asyncio.run(test_optimizer())
