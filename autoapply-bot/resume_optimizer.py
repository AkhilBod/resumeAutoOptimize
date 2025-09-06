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
        return """%-------------------------
% Resume in Latex
% Author : Akhil Bodahanapati (Modified from Jake Gutierrez)
% Based off of: https://github.com/sb2nov/resume
% License : MIT
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.6in}
\\addtolength{\\evensidemargin}{-0.6in}
\\addtolength{\\textwidth}{1.2in}
\\addtolength{\\topmargin}{-.6in}
\\addtolength{\\textheight}{1.1in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-5pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-6pt}]

\\pdfgentounicode=1

% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    #1 \\vspace{-3pt}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-3pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      #1 & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-8pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
  \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-8pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
  \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-8pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-5pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-6pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\begin{document}

%----------HEADING----------
\\begin{center}
  {\\Huge \\scshape Akhil Bodahanapati} \\\\ \\vspace{1pt}
  \\small akb198@pitt.edu $|$ 747-312-1646 $|$
  \\href{https://akhilbod.github.io/}{\\underline{Portfolio}} $|$ 
  \\href{https://github.com/AkhilBod}{\\underline{Github}} $|$
  \\href{https://linkedin.com/in/akhil-bod}{\\underline{Linkedin}} $|$
  {US citizen} 
\\end{center}

%-----------EDUCATION-----------
\\section{Education}
\\resumeSubHeadingListStart
  \\resumeSubheading
    {\\textbf{University of Pittsburgh}}{Pittsburgh, PA}
    {Bachelor of Science in Computer Science, Data Science}{Expected April 2027}
    \\resumeItemListStart
      \\resumeItem{\\textbf{Relevant Coursework:} Computer Architecture, Systems Programming, Discrete Mathematics, Data Structures and Algorithms, Linear Algebra, Calculus 2}
    \\resumeItemListEnd
\\resumeSubHeadingListEnd



%-----------EXPERIENCE-----------
\\section{Experience}
\\resumeSubHeadingListStart

  \\resumeSubheading
    {\\textbf{Software Engineer Intern}}{May 2025 – Present}
    {Federated Hermes}{Pittsburgh, PA}
    \\resumeItemListStart
      \\resumeItem{Develop and optimize 10+ Databricks notebooks (PySpark, SQL), reducing dataset processing time by 25\\%, resulting in a 10\\% cost reduction in cloud compute resources; orchestrate daily ETL jobs (150GB+ data).}
      \\resumeItem{Automated the migration of 20 legacy data pipelines to YAML/Azure DevOps, improving deployment frequency by 50\\% and data volume capacity by 30\\%.}
      \\resumeItem{Awarded 1st place in a company-wide hackathon by developing a solution projected to generate over 500M in revenue.}
    \\resumeItemListEnd

  \\resumeSubheading
    {\\textbf{Full Stack Developer Intern}}{Jun 2024 – Aug 2024}
    {Star Hospitals}{Los Angeles, CA}
    \\resumeItemListStart
      \\resumeItem{Led the development of a patient management system automating bed allocation and triage workflows, resulting in a 20\\% reduction in patient wait times, improving operational efficiency.}
      \\resumeItem{Optimized reporting module with recursive CTEs and indexed views in SQL, reducing data retrieval latency by 40\\%, enabling faster report generation and improved user experience.}
      \\resumeItem{Engineered and deployed RBAC using JWT and Flask-Login, securing 10,000+ medical records and ensuring compliance with DISHA standards, mitigating potential data breaches.}
    \\resumeItemListEnd

  \\resumeSubheading
    {\\textbf{Student Researcher}}{Dec 2024 - Apr 2025 }
    {University of Pittsburgh School of Computing and Information}{Pittsburgh, PA}
    \\resumeItemListStart
      \\resumeItem{Simulated quantum routing protocols (SLMP, QPASS, QCAST) in NetSquid, improving throughput by 25\\% across mesh, ring, and line network topologies.}
      \\resumeItem{Adapted algorithms to platform constraints, reducing average routing latency by 15\\%.}
      \\resumeItem{Co-authored a research paper detailing findings, accepted to the Pitt SCI Undergraduate Research Symposium.}
    \\resumeItemListEnd

\\resumeSubHeadingListEnd

%-----------PROJECTS-----------
\\section{Projects}
\\resumeSubHeadingListStart

  \\resumeProjectHeading
    {\\href{https://www.interviewsense.org/}{\\textbf{InterviewSense.org}: \\textbf{10,000+ Users, Career Practice}} $|$ \\emph{Node.js, PyTorch, PostgreSQL, AWS}}
    {}
  \\resumeItemListStart
    \\resumeItem{Built an AI-powered career prep platform offering behavioral and technical interview practice, resume analysis, system design challenges, and portfolio reviews, now serving 10,000+ users.}
    \\resumeItem{Architected and implemented a modular, scalable backend using Node.js and PostgreSQL, enabling seamless updates and supporting a 30\\% increase in platform users.}
    \\resumeItem{Built a responsive frontend using React and Tailwind CSS to ensure an intuitive, accessible user experience for interview practice and feedback review.}
  \\resumeItemListEnd
\\resumeProjectHeading
    {\\textbf{AI Opportunity Finder: Hackathon Winner} $|$ \\emph{Azure, Databricks, FastAPI, OpenAI, SQL}}
    {}
  \\resumeItemListStart
    \\resumeItem{Won \\textbf{1st place} in a company-wide hackathon by developing a cloud-native investment analytics platform that ingests competitor mutual fund data and processes it at scale using Azure Databricks (PySpark, SQL).}
    \\resumeItem{Implemented quantitative modules to compute key metrics (1Y/3Y/5Y performance, alpha, beta, down-capture) and layered in an OpenAI-based engine to generate persuasive, client-ready narratives.}
    \\resumeItem{Selected for \\textbf{enterprise-wide rollout} by the Portfolio Construction Services team, with a projected impact of \\textbf{\\$500M+ in revenue generation}.}
  \\resumeItemListEnd
  
  \\resumeProjectHeading
    {\\href{https://github.com/Not-Ethan/Orbit}{\\textbf{Tri-Modal AI Search Engine: Hackathon Winner}} $|$ \\emph{React, PyTorch, CLIP, CLAP, Faiss}}
    {}
  \\resumeItemListStart
    \\resumeItem{Spearheaded the development of an innovative tri-modal search engine, earning the "Most Significant Innovation Using Groundbreaking Technology" award against 120+ teams at CMU TartanHacks.}
    \\resumeItem{Engineered a novel query system fusing semantic (text/image via CLIP), acoustic (audio via CLAP), and structured metadata, demonstrably improving search recall by an estimated 40\\% over unimodal baselines.}
    \\resumeItem{\\href{https://github.com/Not-Ethan/Orbit}{\\textit{GitHub Repository}}}
  \\resumeItemListEnd
  

\\resumeSubHeadingListEnd
%-----------SKILLS-----------
\\section{Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\item \\small{
    \\textbf{Programming Languages:} Python, Java, C, SQL \\\\
    \\textbf{Web Development:} JavaScript, React, Node.js, HTML, CSS, Flask \\\\
    \\textbf{Libraries/Frameworks}: Pandas, Selenium, YOLOv3, NumPy \\\\
    \\textbf{AI/ML:} PyTorch, TensorFlow, wav2vec2, CLIP, RoBERTa/DistilBERT
  }
\\end{itemize}

\\end{document}
"""
    
    async def tailor_resume_for_job(self, job_description: str, company_info: Dict[str, Any] = None) -> str:
        """
        Tailor resume for specific job using Gemini AI with intelligent technology extraction
        Same logic as your Chrome extension but enhanced
        """
        try:
            # Extract existing technologies from the resume
            current_technologies = self._extract_resume_technologies(self.base_resume_template)
            
            # Create technology context for the prompt
            tech_context = "\n\nCURRENT RESUME TECHNOLOGY INVENTORY:"
            for category, techs in current_technologies.items():
                if techs:
                    tech_context += f"\n- {category.replace('_', ' ').title()}: {', '.join(techs)}"
            
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
            
            prompt = f"""As an expert resume writer and ATS optimization specialist, please intelligently tailor the following LaTeX resume to match the job description. 

CRITICAL ANALYSIS STEPS:
1. **Extract Current Resume Assets**: Carefully analyze the existing resume to identify:
   - All programming languages, frameworks, libraries, and technologies mentioned
   - Project technologies and tools used (React, Node.js, Python, PyTorch, etc.)
   - Existing skills from the Skills section
   - Technical methodologies and approaches used in experience/projects
   - Quantifiable achievements and metrics

2. **Job Requirements Analysis**: Extract from the job description:
   - Required programming languages and technologies
   - Preferred frameworks and tools
   - Specific skills and qualifications needed
   - Industry-specific terminology and keywords

3. **Strategic Enhancement**: Based on the analysis above:
   - **Skills Section**: Reorganize and emphasize relevant technologies from the resume that match job requirements
   - **Experience Bullets**: Rewrite to highlight relevant technologies and methodologies already present
   - **Project Descriptions**: Emphasize project technologies that align with job requirements
   - **Keyword Integration**: Naturally weave job description keywords using existing resume content as foundation
   - **Technology Stacking**: If the resume shows experience with related technologies, subtly indicate familiarity with job-required ones

FORMATTING REQUIREMENTS:
- Keep the same LaTeX structure and formatting exactly
- DO NOT change: graduation dates, company names, or position titles
- MUST maximize content to fill exactly ONE PAGE
- Maintain professional language and accuracy
- Use quantifiable achievements and technical skills that match the role
- Preserve all LaTeX document structure and commands

ENHANCEMENT STRATEGY:
- If resume shows Python experience and job requires Django, emphasize Python web development experience
- If resume shows JavaScript and job needs TypeScript, highlight JavaScript expertise and modern frameworks
- If resume shows ML experience (PyTorch/TensorFlow) and job needs data science, emphasize AI/ML project aspects
- Reorganize Skills section to lead with most relevant technologies for this role
- Rewrite experience bullets to showcase relevant technical accomplishments using existing projects as proof points

{tech_context}

{company_context}

Job Description:
{job_description}

Current Resume (LaTeX):
{self.base_resume_template}

Please return ONLY the tailored LaTeX code. Make this resume perfectly aligned with the job requirements while building upon the existing skills and experience foundation:"""

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
    
    def _extract_resume_technologies(self, resume_content: str) -> Dict[str, list]:
        """
        Extract technologies, skills, and tools from the existing resume
        """
        import re
        
        technologies = {
            'programming_languages': [],
            'web_technologies': [],
            'frameworks_libraries': [],
            'databases': [],
            'ai_ml_tools': [],
            'cloud_platforms': [],
            'tools_software': [],
            'methodologies': []
        }
        
        # Common technology patterns to look for
        tech_patterns = {
            'programming_languages': r'\b(Python|Java|JavaScript|TypeScript|C\+\+|C|C#|Go|Rust|Swift|Kotlin|PHP|Ruby|Scala|R|MATLAB|SQL)\b',
            'web_technologies': r'\b(React|Angular|Vue\.js|Node\.js|Express|Flask|Django|HTML|CSS|SASS|SCSS|Bootstrap|Tailwind|jQuery)\b',
            'frameworks_libraries': r'\b(PyTorch|TensorFlow|Pandas|NumPy|Selenium|YOLOv3|CLIP|CLAP|RoBERTa|DistilBERT|wav2vec2|Faiss|Spring|Laravel|Rails)\b',
            'databases': r'\b(PostgreSQL|MySQL|MongoDB|Redis|SQLite|Oracle|SQL Server|Cassandra|DynamoDB)\b',
            'ai_ml_tools': r'\b(PyTorch|TensorFlow|Keras|scikit-learn|OpenCV|NLTK|spaCy|Hugging Face|BERT|GPT|CLIP|YOLO)\b',
            'cloud_platforms': r'\b(AWS|Azure|Google Cloud|GCP|Docker|Kubernetes|Jenkins|Git|GitHub|GitLab)\b',
            'tools_software': r'\b(Git|Docker|Jenkins|VS Code|IntelliJ|Eclipse|Jira|Confluence|Slack|Teams)\b',
            'methodologies': r'\b(Agile|Scrum|DevOps|CI/CD|REST|GraphQL|API|Microservices|ETL|RBAC|JWT)\b'
        }
        
        for category, pattern in tech_patterns.items():
            matches = re.findall(pattern, resume_content, re.IGNORECASE)
            technologies[category] = list(set(matches))  # Remove duplicates
        
        return technologies
    
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
        prompt = f"""Please intelligently optimize this LaTeX resume for Applicant Tracking Systems (ATS) while preserving and enhancing the existing content foundation.

INTELLIGENT ATS OPTIMIZATION APPROACH:
1. **Content Analysis**: Identify all existing technologies, skills, and achievements in the resume
2. **ATS Enhancement**: Optimize structure and keywords while building upon existing content
3. **Skill Amplification**: Use existing technical foundation to create ATS-friendly skill presentations

ATS OPTIMIZATION STRATEGIES:
- **Section Headers**: Ensure standard, ATS-readable section names (Skills, Experience, Projects, Education)
- **Technology Keywords**: Extract and emphasize existing technologies from projects and experience
- **Skill Organization**: Reorganize Skills section for optimal ATS parsing and keyword density
- **Achievement Quantification**: Ensure all quantifiable metrics are clearly formatted
- **Keyword Integration**: Naturally integrate industry-standard terms based on existing experience

TECHNICAL REQUIREMENTS:
- Use existing technical stack as foundation for keyword optimization
- Maintain consistent formatting throughout for ATS parsing
- Remove complex LaTeX formatting that might confuse ATS systems
- Ensure proper keyword density without keyword stuffing
- Keep the same overall structure and content length
- Build upon existing achievements and technologies

CONTENT ENHANCEMENT RULES:
- Use existing project technologies to create comprehensive skill listings
- Leverage current experience patterns for industry-standard terminology
- Ensure all technical terms are industry-standard and ATS-recognizable
- Maintain authenticity - enhance rather than fabricate

Resume to optimize:
{resume_content}

Return the ATS-optimized LaTeX code that maximizes the existing content for ATS success:"""

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
