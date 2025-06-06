// Resume Tailor AI - Popup JavaScript

class ResumeTailorApp {
    constructor() {
        this.geminiApiKey = '';
        this.defaultResumeTemplate = this.getDefaultTemplate();
        this.tailoredResumeLatex = '';
        this.init();
    }

    async init() {
        await this.loadStoredData();
        this.setupEventListeners();
        this.loadDefaultTemplate();
    }

    async loadStoredData() {
        try {
            const result = await chrome.storage.local.get(['geminiApiKey']);
            if (result.geminiApiKey) {
                this.geminiApiKey = result.geminiApiKey;
                document.getElementById('geminiApiKey').value = this.geminiApiKey;
            }
        } catch (error) {
            console.error('Error loading stored data:', error);
        }
    }

    setupEventListeners() {
        document.getElementById('saveApiKey').addEventListener('click', () => this.saveApiKey());
        document.getElementById('loadTemplate').addEventListener('click', () => this.loadDefaultTemplate());
        document.getElementById('tailorResume').addEventListener('click', () => this.tailorResume());
        document.getElementById('downloadPdf').addEventListener('click', () => this.downloadPdf());
        document.getElementById('copyLatex').addEventListener('click', () => this.copyLatex());
        document.getElementById('editResume').addEventListener('click', () => this.editResume());
    }

    async saveApiKey() {
        const apiKey = document.getElementById('geminiApiKey').value.trim();
        if (!apiKey) {
            this.showStatus('Please enter a valid API key', 'error');
            return;
        }

        try {
            await chrome.storage.local.set({ geminiApiKey: apiKey });
            this.geminiApiKey = apiKey;
            this.showStatus('API key saved successfully!', 'success');
        } catch (error) {
            this.showStatus('Failed to save API key', 'error');
            console.error('Error saving API key:', error);
        }
    }

    loadDefaultTemplate() {
        document.getElementById('resumeTemplate').value = this.defaultResumeTemplate;
        this.showStatus('Default template loaded', 'info');
    }

    async tailorResume() {
        const jobDescription = document.getElementById('jobDescription').value.trim();
        const resumeTemplate = document.getElementById('resumeTemplate').value.trim();

        if (!this.geminiApiKey) {
            this.showStatus('Please save your Gemini API key first', 'error');
            return;
        }

        if (!jobDescription) {
            this.showStatus('Please enter a job description', 'error');
            return;
        }

        if (!resumeTemplate) {
            this.showStatus('Please provide a resume template', 'error');
            return;
        }

        this.setLoading(true);
        this.showStatus('Tailoring your resume with AI...', 'info');

        try {
            const tailoredResume = await this.callGeminiAPI(jobDescription, resumeTemplate);
            this.tailoredResumeLatex = tailoredResume;
            
            document.getElementById('tailoredResume').value = tailoredResume;
            document.querySelector('.result-section').style.display = 'block';
            document.getElementById('downloadPdf').style.display = 'block';
            
            this.showStatus('Resume tailored successfully!', 'success');
        } catch (error) {
            this.showStatus('Failed to tailor resume: ' + error.message, 'error');
            console.error('Error tailoring resume:', error);
        } finally {
            this.setLoading(false);
        }
    }

    async callGeminiAPI(jobDescription, resumeTemplate) {
        const prompt = `As an expert resume writer, please tailor the following LaTeX resume to better match the job description. Keep the same LaTeX structure and formatting, but modify the content to:

1. Highlight relevant skills and experiences
2. Use keywords from the job description
3. Reorder or emphasize sections that match the job requirements
4. Maintain professional language and accuracy
5. Keep the same LaTeX document structure and commands

Job Description:
${jobDescription}

Current Resume (LaTeX):
${resumeTemplate}

Please return ONLY the tailored LaTeX code, maintaining all formatting and structure:`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.geminiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 8192,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to call Gemini API');
        }

        const data = await response.json();
        const tailoredContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!tailoredContent) {
            throw new Error('No content received from Gemini API');
        }

        // Clean up the response - remove markdown code blocks if present
        let cleanedContent = tailoredContent.trim();
        if (cleanedContent.startsWith('```latex')) {
            cleanedContent = cleanedContent.replace(/^```latex\n/, '').replace(/\n```$/, '');
        } else if (cleanedContent.startsWith('```')) {
            cleanedContent = cleanedContent.replace(/^```\n/, '').replace(/\n```$/, '');
        }

        return cleanedContent.trim();
    }

    async downloadPdf() {
        if (!this.tailoredResumeLatex) {
            this.showStatus('No tailored resume to download', 'error');
            return;
        }

        this.showStatus('Generating PDF...', 'info');

        try {
            // Create a simple HTML page that will compile LaTeX to PDF
            const htmlContent = this.createLatexCompilerPage(this.tailoredResumeLatex);
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            // Open in new tab for manual compilation
            chrome.tabs.create({ url: url });
            
            this.showStatus('LaTeX compiler opened in new tab. Use online LaTeX compiler to generate PDF.', 'success');
        } catch (error) {
            this.showStatus('Failed to create download: ' + error.message, 'error');
            console.error('Error creating download:', error);
        }
    }

    createLatexCompilerPage(latexContent) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume LaTeX Compiler</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 20px; 
            background: #f5f5f5;
        }
        .container { 
            background: white; 
            padding: 30px; 
            border-radius: 10px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            color: #333;
        }
        .latex-content { 
            background: #f8f8f8; 
            padding: 20px; 
            border-radius: 5px; 
            font-family: 'Courier New', monospace; 
            font-size: 12px; 
            line-height: 1.4;
            white-space: pre-wrap;
            border: 1px solid #ddd;
            max-height: 500px;
            overflow-y: auto;
        }
        .actions { 
            margin: 20px 0; 
            text-align: center; 
        }
        .btn { 
            background: #007bff; 
            color: white; 
            padding: 12px 24px; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer; 
            margin: 0 10px;
            text-decoration: none;
            display: inline-block;
            font-size: 14px;
        }
        .btn:hover { 
            background: #0056b3; 
        }
        .btn-secondary {
            background: #6c757d;
        }
        .btn-secondary:hover {
            background: #545b62;
        }
        .instructions {
            background: #e7f3ff;
            border: 1px solid #b3d7ff;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        .instructions h3 {
            margin-top: 0;
            color: #0066cc;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Tailored Resume - LaTeX Source</h1>
            <p>Your AI-tailored resume is ready for compilation</p>
        </div>
        
        <div class="instructions">
            <h3>📋 Instructions:</h3>
            <ol>
                <li><strong>Copy the LaTeX code</strong> below using the "Copy LaTeX" button</li>
                <li><strong>Visit an online LaTeX compiler</strong> like <a href="https://www.overleaf.com/project" target="_blank">Overleaf</a> or <a href="https://latexbase.com/" target="_blank">LaTeX Base</a></li>
                <li><strong>Create a new project</strong> and paste the code</li>
                <li><strong>Compile to generate PDF</strong> and download your tailored resume</li>
            </ol>
        </div>

        <div class="actions">
            <button class="btn" onclick="copyLatexCode()">📋 Copy LaTeX Code</button>
            <a href="https://www.overleaf.com/project" target="_blank" class="btn btn-secondary">🔗 Open Overleaf</a>
            <a href="https://latexbase.com/" target="_blank" class="btn btn-secondary">🔗 Open LaTeX Base</a>
        </div>

        <div class="latex-content" id="latexContent">${latexContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>

        <div class="actions">
            <button class="btn" onclick="copyLatexCode()">📋 Copy LaTeX Code</button>
        </div>
    </div>

    <script>
        function copyLatexCode() {
            const latexContent = \`${latexContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
            navigator.clipboard.writeText(latexContent).then(() => {
                alert('LaTeX code copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy: ', err);
                // Fallback - select the text
                const textArea = document.createElement('textarea');
                textArea.value = latexContent;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('LaTeX code copied to clipboard!');
            });
        }
    </script>
</body>
</html>`;
    }

    copyLatex() {
        if (!this.tailoredResumeLatex) {
            this.showStatus('No tailored resume to copy', 'error');
            return;
        }

        navigator.clipboard.writeText(this.tailoredResumeLatex).then(() => {
            this.showStatus('LaTeX code copied to clipboard!', 'success');
        }).catch(err => {
            this.showStatus('Failed to copy to clipboard', 'error');
            console.error('Failed to copy: ', err);
        });
    }

    editResume() {
        const tailoredTextarea = document.getElementById('tailoredResume');
        tailoredTextarea.readOnly = false;
        tailoredTextarea.style.backgroundColor = '#fff';
        tailoredTextarea.focus();
        
        // Update the stored version when user modifies
        tailoredTextarea.addEventListener('input', (e) => {
            this.tailoredResumeLatex = e.target.value;
        });

        this.showStatus('Resume is now editable', 'info');
    }

    setLoading(isLoading) {
        const button = document.getElementById('tailorResume');
        const buttonText = button.querySelector('.btn-text');
        const loader = button.querySelector('.loader');

        if (isLoading) {
            button.disabled = true;
            buttonText.style.display = 'none';
            loader.style.display = 'block';
        } else {
            button.disabled = false;
            buttonText.style.display = 'block';
            loader.style.display = 'none';
        }
    }

    showStatus(message, type) {
        const statusDiv = document.getElementById('status');
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                statusDiv.textContent = '';
                statusDiv.className = 'status';
            }, 5000);
        }
    }

    getDefaultTemplate() {
        return `%-------------------------
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

% Adjusted margins slightly for potentially more content, can be tweaked
\\addtolength{\\oddsidemargin}{-0.6in}
\\addtolength{\\evensidemargin}{-0.6in}
\\addtolength{\\textwidth}{1.2in} % Increased textwidth slightly
\\addtolength{\\topmargin}{-.6in} % Adjusted top margin
\\addtolength{\\textheight}{1.1in} % Adjusted text height

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-5pt}\\scshape\\raggedright\\large % Slightly reduced vspace
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-6pt}] % Slightly reduced vspace

\\pdfgentounicode=1

% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    #1 \\vspace{-3pt} % Slightly reduced vspace
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-3pt}\\item % Slightly reduced vspace
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-8pt} % Slightly reduced vspace
}

\\newcommand{\\resumeSubSubheading}[2]{
  \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-8pt} % Slightly reduced vspace
}

\\newcommand{\\resumeProjectHeading}[2]{
  \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-8pt} % Slightly reduced vspace
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-5pt}} % Slightly reduced vspace

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-6pt}} % Slightly reduced vspace

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\begin{document}

%----------HEADING----------
\\begin{center}
  \\textbf{\\Huge \\scshape Akhil Bodahanapati} \\\\ \\vspace{1pt}
  \\small akb198@pitt.edu $|$ 747-312-1646 $|$ Pittsburgh, PA $|$
  \\href{https://akhilbod.github.io/}{\\underline{akhilbod.github.io}} $|$ 
  \\href{https://github.com/AkhilBod}{\\underline{github.com/AkhilBod}} $|$
  \\href{https://linkedin.com/in/akhil-bod}{\\underline{linkedin.com/in/akhil-bod}} 
\\end{center}

%-----------EDUCATION-----------
\\section{Education}
\\resumeSubHeadingListStart
  \\resumeSubheading
    {University of Pittsburgh}{Pittsburgh, PA}
    {Bachelor of Science in Computer Science, Data Science}{Expected April 2027}
    \\resumeItemListStart
      \\resumeItem{\\textbf{Relevant Coursework:} Computer Architecture, Systems Programming, Discrete Mathematics, Data Structures and Algorithms I, Linear Algebra, Calculus 1}
    \\resumeItemListEnd
\\resumeSubHeadingListEnd

%-----------SKILLS-----------
\\section{Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\item \\small{
    \\textbf{Programming Languages:} Python, Java, C, SQL. \\\\
    \\textbf{Web Development:} JavaScript, React, Node.js, HTML, CSS, Flask. \\\\
    \\textbf{Libraries/Frameworks:} Pandas, Selenium, YOLOv3, Flask, NumPy. \\\\
    \\textbf{AI/ML:} PyTorch, TensorFlow, wav2vec2, CLIP, RoBERTa/DistilBERT.
  }
\\end{itemize}

%-----------EXPERIENCE-----------
\\section{Experience}
\\resumeSubHeadingListStart

  \\resumeSubheading
    {Database Engineer Intern}{May 2025 – Present}
    {Federated Hermes}{Pittsburgh, PA}
    \\resumeItemListStart
      \\resumeItem{Develop and optimize 10+ Databricks notebooks (PySpark, SQL), reducing dataset processing time by 25\\%; orchestrate daily ETL jobs (150GB+ data).}
      \\resumeItem{Migrated ~20 legacy data pipelines to YAML/Azure DevOps, improving deployment frequency by 50\\% and data volume capacity by 30\\%.}
      \\resumeItem{Standardized 40+ Boomi connectors, cutting integration failures 15\\%; refactored ~1,500 Java lines (SOLID), reducing logging overhead 10\\%.}
    \\resumeItemListEnd

  \\resumeSubheading
    {Full Stack Developer Intern}{Jun 2024 – Aug 2024}
    {Star Hospitals}{Hyderabad, IN}
    \\resumeItemListStart
      \\resumeItem{Led development of a patient management system automating bed allocation and triage workflows based on severity scores, improving operational efficiency.}
      \\resumeItem{Optimized reporting module with recursive Common Table Expressions (CTEs) and indexed views in SQL, reducing data retrieval latency by 40\\%.}
      \\resumeItem{Implemented role-based access control (RBAC) using JWT and Flask-Login to secure 10,000+ medical records and adhere to DISHA standards.}
    \\resumeItemListEnd

  \\resumeSubheading
    {Student Researcher}{Jan 2025 – May 2025}
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
    {\\textbf{\\href{https://www.interviewsense.org/}{InterviewSense: AI-Powered Mock Interview}} $|$ \\emph{Node.js, PyTorch, PostgreSQL, AWS}}
    {May 2024 -- Present}
  \\resumeItemListStart
    \\resumeItem{Leading the development of an AI-driven platform that delivers realistic, role-specific mock interviews with dynamic question generation and personalized performance feedback.}
    \\resumeItem{Integrated wav2vec2 and fine-tuned RoBERTa/DistilBERT models to analyze speech patterns (e.g., confidence, hesitation) and semantic content, achieving 95\\% precision in identifying candidate improvement areas.}
    \\resumeItem{Designed and implemented a modular, scalable backend with Node.js and PostgreSQL, supporting seamless updates to roles, questions, and ML models; \\textbf{onboarded 500+ interested}}
    \\resumeItem{Building a responsive frontend using React and Tailwind CSS to ensure an intuitive, accessible user experience for interview practice and feedback review.}
    \\resumeItem{\\href{https://www.interviewsense.org/}{\\textit{Website}}}
  \\resumeItemListEnd

  \\resumeProjectHeading
    {\\textbf{\\href{https://github.com/Not-Ethan/Orbit}{Orbit: Tri-Modal AI Search Engine}} $|$ \\emph{Python, Flask, React, PyTorch, CLIP, CLAP, Faiss}}
    {Jan 2025 – Feb 2025}
  \\resumeItemListStart
    \\resumeItem{Spearheaded the development of an innovative tri-modal search engine, earning the "Most Significant Innovation Using Groundbreaking Technology" award against 120+ teams at CMU TartanHacks.}
    \\resumeItem{Engineered a novel query system fusing semantic (text/image via CLIP), acoustic (audio via CLAP), and structured metadata, demonstrably improving search recall by an estimated \\textbf{40\\%} over unimodal baselines on diverse datasets.}
    \\resumeItem{Implemented a custom high-performance vector similarity engine with Faiss, achieving sub-second (<500ms) query latency across a testbed of 10,000+ multimodal items.}
    \\resumeItem{\\href{https://github.com/Not-Ethan/Orbit}{\\textit{GitHub Repository}}}
  \\resumeItemListEnd
\\resumeSubHeadingListEnd

\\end{document}`;
    }
}

// Initialize the app when the popup loads
document.addEventListener('DOMContentLoaded', () => {
    new ResumeTailorApp();
});
