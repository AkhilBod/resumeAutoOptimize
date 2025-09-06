// Resume Tailor AI - Popup JavaScript

class ResumeTailorApp {
    async shortenResume() {
        const tailoredResume = document.getElementById('tailoredResume').value.trim();
        if (!tailoredResume) {
            this.showStatus('No tailored resume to shorten', 'error');
            return;
        }
        const role = document.getElementById('roleInput') ? document.getElementById('roleInput').value.trim() : '';
        this.setLoading(true);
        this.showStatus('Shortening your tailored resume...', 'info');
        try {
            const shortened = await this.callGeminiShortenAPI(tailoredResume, role);
            this.tailoredResumeLatex = shortened;
            document.getElementById('tailoredResume').value = shortened;
            this.showStatus('Resume shortened successfully!', 'success');
        } catch (error) {
            this.showStatus('Failed to shorten resume: ' + error.message, 'error');
            console.error('Error shortening resume:', error);
        } finally {
            this.setLoading(false);
        }
    }

    async callGeminiShortenAPI(latexResume, role) {
        const prompt = `Shorten the following LaTeX resume by removing at most one line of content (one bullet or one line anywhere), making the resume just slightly shorter. Do NOT aggressively cut or summarize. Only remove a single line that is least relevant to the target role: "${role}" if possible. Keep all formatting and structure, and do not change anything else.\n\nResume (LaTeX):\n${latexResume}\n\nReturn ONLY the slightly shortened LaTeX code, with at most one line removed.`;
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
        const shortenedContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!shortenedContent) {
            throw new Error('No content received from Gemini API');
        }
        let cleanedContent = shortenedContent.trim();
        if (cleanedContent.startsWith('```latex')) {
            cleanedContent = cleanedContent.replace(/^```latex\n/, '').replace(/\n```$/, '');
        } else if (cleanedContent.startsWith('```')) {
            cleanedContent = cleanedContent.replace(/^```\n/, '').replace(/\n```$/, '');
        }
        return cleanedContent.trim();
    }
    constructor() {
        // API key embedded directly in the extension
        this.geminiApiKey = 'AIzaSyA8Z5eTpRLFZrdN7XyWtF3XS1sKsk5SY2I';
        this.defaultResumeTemplate = this.getDefaultTemplate();
        this.tailoredResumeLatex = '';
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.loadDefaultTemplate();
        // API key is pre-configured, so show ready status
        this.showStatus('Ready to tailor resumes! 🚀', 'success');
    }

    setupEventListeners() {
        document.getElementById('loadTemplate').addEventListener('click', () => this.loadDefaultTemplate());
        document.getElementById('tailorResume').addEventListener('click', () => this.tailorResume());
        document.getElementById('downloadPdf').addEventListener('click', () => this.downloadPdf());
        document.getElementById('openOverleaf').addEventListener('click', () => this.openInOverleaf(this.tailoredResumeLatex));
        document.getElementById('copyLatex').addEventListener('click', () => this.copyLatex());
        document.getElementById('editResume').addEventListener('click', () => this.editResume());
        const shortenBtn = document.getElementById('shortenResume');
        if (shortenBtn) {
            shortenBtn.addEventListener('click', () => this.shortenResume());
        }
        
        // New event listeners for PDF preview and refinements
        document.getElementById('generatePreview').addEventListener('click', () => this.generatePdfPreview());
        document.getElementById('sendRefinement').addEventListener('click', () => this.sendRefinement());
        
        // Allow Enter key to send refinements (with Shift+Enter for new lines)
        document.getElementById('refinementInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendRefinement();
            }
        });
    }

    loadDefaultTemplate() {
        document.getElementById('resumeTemplate').value = this.defaultResumeTemplate;
        this.showStatus('Default template loaded', 'info');
    }

    async tailorResume() {
        const jobDescription = document.getElementById('jobDescription').value.trim();
        const role = document.getElementById('roleInput') ? document.getElementById('roleInput').value.trim() : '';
        const resumeTemplate = document.getElementById('resumeTemplate').value.trim();

        if (!jobDescription) {
            this.showStatus('Please enter a job description', 'error');
            return;
        }

        if (!resumeTemplate) {
            this.showStatus('Please provide a resume template', 'error');
            return;
        }

        if (!role) {
            this.showStatus('Please enter a target role', 'error');
            return;
        }

        this.setLoading(true);
        this.showStatus('Tailoring your resume with AI...', 'info');

        try {
            const tailoredResume = await this.callGeminiAPI(jobDescription, resumeTemplate, role);
            this.tailoredResumeLatex = tailoredResume;
            
            document.getElementById('tailoredResume').value = tailoredResume;
            document.querySelector('.result-section').style.display = 'block';
            document.querySelector('.download-buttons').style.display = 'block';
            document.querySelector('.pdf-preview-section').style.display = 'block';
            document.querySelector('.refinement-section').style.display = 'block';
            
            // Auto-generate PDF preview
            setTimeout(() => this.generatePdfPreview(), 500);
            
            this.showStatus('Resume tailored successfully!', 'success');
        } catch (error) {
            this.showStatus('Failed to tailor resume: ' + error.message, 'error');
            console.error('Error tailoring resume:', error);
        } finally {
            this.setLoading(false);
        }
    }

    async callGeminiAPI(jobDescription, resumeTemplate, role) {
        const prompt = `As an expert resume writer and ATS optimization specialist, please intelligently tailor the following LaTeX resume to match the job description and target role.

CRITICAL ANALYSIS STEPS:
1. **Extract Current Resume Assets**: Carefully analyze the existing resume to identify:
   - All programming languages, frameworks, libraries, and technologies mentioned in projects and experience
   - Skills from the Skills section (Programming Languages, Web Development, Libraries/Frameworks, AI/ML)
   - Technical achievements and quantifiable metrics from experience
   - Project technologies and methodologies used
   - Industry terminology and approaches demonstrated

2. **Job Requirements Analysis**: Extract from the job description:
   - Required and preferred programming languages and technologies
   - Specific frameworks, libraries, and tools mentioned
   - Industry-specific skills and qualifications
   - Keywords and terminology used
   - Seniority level and experience expectations

3. **Strategic Tailoring for Role: "${role}"**:
   - **Skills Reorganization**: Reorder Skills section to lead with most relevant technologies for this role
   - **Experience Enhancement**: Rewrite all experience bullets to emphasize relevant technologies and achievements
   - **Project Optimization**: Highlight project aspects that align with job requirements and role expectations
   - **Technology Emphasis**: Build upon existing technical foundation to match job requirements
   - **Keyword Integration**: Naturally weave job description keywords using existing resume content

SMART TECHNOLOGY MATCHING:
- If resume shows Python and job requires Django/Flask, emphasize Python web development experience
- If resume shows JavaScript/React and job needs TypeScript/Angular, highlight modern JS framework expertise
- If resume shows PyTorch/TensorFlow and job needs ML, emphasize AI/ML project accomplishments
- If resume shows SQL and job needs specific databases, highlight database optimization experience
- Use existing project technologies as proof points for related job requirements

FORMATTING REQUIREMENTS:
- Keep the same LaTeX structure and formatting exactly
- Change job titles in Experience and Projects to best match target role while keeping company names unchanged
- DO NOT change company names or graduation dates
- MUST maintain exact same content length - fill exactly ONE PAGE
- Rewrite ALL experience and project bullet points for maximum relevance to "${role}"
- Reorganize Skills section for optimal relevance

CRITICAL SUCCESS FACTORS:
- Build upon existing technical foundation rather than adding unrelated skills
- Use quantifiable achievements that demonstrate relevant capabilities
- Ensure natural keyword integration without keyword stuffing
- Maintain professional accuracy while maximizing role alignment

Target Role: ${role}

Job Description:
${jobDescription}

Current Resume (LaTeX):
${resumeTemplate}

Please return ONLY the tailored LaTeX code with strategic enhancements for this specific role:`;

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

        this.showStatus('Compiling LaTeX to PDF...', 'info');

        try {
            // Use LaTeX.Online API for direct PDF compilation
            const pdfBlob = await this.compileLatexToPdf(this.tailoredResumeLatex);
            
            // Create download link
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Akhil Resume SWE 2027.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showStatus('PDF downloaded successfully!', 'success');
        } catch (error) {
            this.showStatus('Failed to compile PDF: ' + error.message + ' - Try Overleaf instead', 'error');
            console.error('Error compiling PDF:', error);
        }
    }

    async compileLatexToPdf(latexContent) {
        // Use LaTeX.Online free API service
        const apiUrl = 'https://latex.ytotech.com/builds/sync';
        
        // Create form data
        const formData = new FormData();
        formData.append('compiler', 'pdflatex');
        formData.append('resources', new Blob([latexContent], { type: 'text/plain' }), 'main.tex');

        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Compilation failed: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/pdf')) {
            const text = await response.text();
            throw new Error('Compilation failed - check LaTeX syntax');
        }

        return await response.blob();
    }

    async openInOverleaf(latexContent) {
        // Create a form to submit the LaTeX content to Overleaf
        const form = document.createElement('form');
        form.action = 'https://www.overleaf.com/docs';
        form.method = 'post';
        form.target = '_blank';
        form.style.display = 'none';

        // Add the LaTeX content as encoded snippet
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'encoded_snip';
        input.value = encodeURIComponent(latexContent);
        form.appendChild(input);

        // Add engine specification (pdflatex)
        const engineInput = document.createElement('input');
        engineInput.type = 'hidden';
        engineInput.name = 'engine';
        engineInput.value = 'pdflatex';
        form.appendChild(engineInput);

        // Add to document, submit, and clean up
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
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

    async generatePdfPreview() {
        if (!this.tailoredResumeLatex) {
            this.showStatus('No tailored resume to preview', 'error');
            return;
        }

        const previewStatus = document.getElementById('previewStatus');
        const iframe = document.getElementById('pdfPreview');
        
        previewStatus.textContent = 'Generating PDF preview...';
        
        try {
            const pdfBlob = await this.compileLatexToPdf(this.tailoredResumeLatex);
            const pdfUrl = URL.createObjectURL(pdfBlob);
            
            iframe.src = pdfUrl;
            previewStatus.textContent = 'Preview ready! Check if it fits on one page.';
            
            // Clean up previous URL
            if (this.currentPdfUrl) {
                URL.revokeObjectURL(this.currentPdfUrl);
            }
            this.currentPdfUrl = pdfUrl;
            
        } catch (error) {
            previewStatus.textContent = 'Preview failed - try Overleaf instead';
            iframe.src = '';
            console.error('Error generating preview:', error);
        }
    }

    async sendRefinement() {
        const refinementInput = document.getElementById('refinementInput');
        const refinementText = refinementInput.value.trim();
        
        if (!refinementText) {
            this.showStatus('Please enter a refinement request', 'error');
            return;
        }

        if (!this.tailoredResumeLatex) {
            this.showStatus('No resume to refine', 'error');
            return;
        }

        // Add user message to chat
        this.addChatMessage('user', refinementText);
        refinementInput.value = '';

        this.setLoading(true);
        this.showStatus('Applying your refinements...', 'info');

        try {
            const refinedResume = await this.callGeminiRefinementAPI(this.tailoredResumeLatex, refinementText);
            this.tailoredResumeLatex = refinedResume;
            
            document.getElementById('tailoredResume').value = refinedResume;
            
            // Add assistant response to chat
            this.addChatMessage('assistant', 'I\'ve applied your requested changes to the resume.');
            
            // Auto-regenerate preview
            setTimeout(() => this.generatePdfPreview(), 500);
            
            this.showStatus('Refinements applied successfully!', 'success');
        } catch (error) {
            this.addChatMessage('assistant', 'Sorry, I couldn\'t apply those changes. Please try again.');
            this.showStatus('Failed to apply refinements: ' + error.message, 'error');
            console.error('Error applying refinements:', error);
        } finally {
            this.setLoading(false);
        }
    }

    async callGeminiRefinementAPI(currentResume, refinementRequest) {
        const prompt = `You are an expert resume refinement specialist. The user has requested specific changes to their LaTeX resume. 

ANALYSIS & REFINEMENT APPROACH:
1. **Current Resume Analysis**: First, understand what technologies, skills, and experiences are already present in the resume
2. **User Request Processing**: Interpret the user's refinement request in the context of existing resume content
3. **Strategic Enhancement**: Make the requested changes while leveraging existing skills and technologies as foundation

REFINEMENT PRINCIPLES:
- If user requests new technology skills, check if related technologies already exist in resume to build upon
- If user wants to emphasize certain experiences, identify existing bullet points that can be enhanced
- If user requests industry-specific modifications, use existing projects/experience as proof points
- When adding new content, ensure it aligns with existing skill set and experience level

TECHNICAL REQUIREMENTS:
- Maintain the exact same LaTeX structure and formatting
- Keep the resume to exactly ONE PAGE - do not make it longer or shorter
- Preserve all company names and dates exactly as they are
- Make only the specific changes requested by the user
- Ensure the output is valid LaTeX code
- Build upon existing technologies and skills rather than adding unrelated content

SMART CONTENT INTEGRATION:
- Leverage existing project technologies to support new skill claims
- Use existing experience patterns to write new bullet points
- Maintain consistency with current technical depth and expertise level
- Ensure new content feels authentic to the existing resume foundation

User's refinement request: "${refinementRequest}"

Current Resume (LaTeX):
${currentResume}

Please return ONLY the refined LaTeX code with the requested changes applied intelligently:`;

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
        const refinedContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!refinedContent) {
            throw new Error('No content received from Gemini API');
        }

        // Clean up the response - remove markdown code blocks if present
        let cleanedContent = refinedContent.trim();
        if (cleanedContent.startsWith('```latex')) {
            cleanedContent = cleanedContent.replace(/^```latex\n/, '').replace(/\n```$/, '');
        } else if (cleanedContent.startsWith('```')) {
            cleanedContent = cleanedContent.replace(/^```\n/, '').replace(/\n```$/, '');
        }

        return cleanedContent.trim();
    }

    addChatMessage(sender, message) {
        const chatHistory = document.getElementById('chatHistory');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        
        const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const senderLabel = sender === 'user' ? 'You' : 'AI Assistant';
        
        messageDiv.innerHTML = `
            <div class="timestamp">${timestamp} - ${senderLabel}</div>
            <div>${message}</div>
        `;
        
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
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

\\end{document}`;
    }
}

// Initialize the app when the popup loads
document.addEventListener('DOMContentLoaded', () => {
    new ResumeTailorApp();
});
