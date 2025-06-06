// Resume Tailor AI - Background Service Worker

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Resume Tailor AI extension installed');
        
        // Set default settings
        chrome.storage.local.set({
            extensionVersion: '1.0',
            installDate: new Date().toISOString()
        });
    }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'compileLatex') {
        handleLatexCompilation(request.latexContent, sendResponse);
        return true; // Will respond asynchronously
    }
});

async function handleLatexCompilation(latexContent, sendResponse) {
    try {
        // Create a new tab with the LaTeX compiler page
        const tab = await chrome.tabs.create({
            url: 'data:text/html;charset=utf-8,' + encodeURIComponent(createCompilerPage(latexContent)),
            active: true
        });
        
        sendResponse({ success: true, tabId: tab.id });
    } catch (error) {
        sendResponse({ success: false, error: error.message });
    }
}

function createCompilerPage(latexContent) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume LaTeX Compiler</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 700;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1em;
        }
        .content {
            padding: 30px;
        }
        .instructions {
            background: #f8f9ff;
            border: 2px solid #e6e9ff;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }
        .instructions h3 {
            color: #4c63d2;
            margin-top: 0;
            font-size: 1.3em;
        }
        .instructions ol {
            padding-left: 20px;
        }
        .instructions li {
            margin-bottom: 8px;
        }
        .instructions a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
        }
        .instructions a:hover {
            text-decoration: underline;
        }
        .actions {
            text-align: center;
            margin: 30px 0;
        }
        .btn {
            display: inline-block;
            padding: 15px 30px;
            margin: 0 10px 10px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        .btn-secondary {
            background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
            box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
        }
        .btn-secondary:hover {
            box-shadow: 0 8px 25px rgba(108, 117, 125, 0.4);
        }
        .latex-content {
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            font-family: 'JetBrains Mono', 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.5;
            white-space: pre-wrap;
            word-wrap: break-word;
            max-height: 600px;
            overflow-y: auto;
            margin: 20px 0;
        }
        .copy-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
            transform: translateX(400px);
            transition: transform 0.3s ease;
            z-index: 1000;
        }
        .copy-notification.show {
            transform: translateX(0);
        }
        .compiler-links {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .compiler-card {
            background: #fff;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            transition: all 0.3s ease;
            text-decoration: none;
            color: inherit;
        }
        .compiler-card:hover {
            border-color: #667eea;
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            text-decoration: none;
            color: inherit;
        }
        .compiler-card h4 {
            color: #495057;
            margin: 0 0 10px 0;
            font-size: 1.2em;
        }
        .compiler-card p {
            color: #6c757d;
            margin: 0;
            font-size: 0.9em;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .feature {
            text-align: center;
            padding: 20px;
        }
        .feature-icon {
            font-size: 2em;
            margin-bottom: 10px;
        }
        .feature h4 {
            color: #495057;
            margin: 0 0 10px 0;
        }
        .feature p {
            color: #6c757d;
            margin: 0;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Resume LaTeX Compiler</h1>
            <p>Your AI-tailored resume is ready for compilation</p>
        </div>
        
        <div class="content">
            <div class="instructions">
                <h3>📋 Quick Start Guide</h3>
                <ol>
                    <li><strong>Copy the LaTeX code</strong> below using the "📋 Copy LaTeX" button</li>
                    <li><strong>Choose your compiler</strong> from the options below (Overleaf recommended)</li>
                    <li><strong>Create a new document</strong> and paste your code</li>
                    <li><strong>Compile and download</strong> your polished PDF resume</li>
                </ol>
            </div>

            <div class="actions">
                <button class="btn" onclick="copyLatexCode()">📋 Copy LaTeX Code</button>
            </div>

            <div class="compiler-links">
                <a href="https://www.overleaf.com/project" target="_blank" class="compiler-card">
                    <h4>🍃 Overleaf</h4>
                    <p>Professional online LaTeX editor with real-time collaboration</p>
                </a>
                <a href="https://latexbase.com/" target="_blank" class="compiler-card">
                    <h4>📄 LaTeX Base</h4>
                    <p>Simple and fast online LaTeX compiler</p>
                </a>
                <a href="https://www.writelatex.com/" target="_blank" class="compiler-card">
                    <h4>✍️ WriteLaTeX</h4>
                    <p>Easy-to-use online LaTeX editor</p>
                </a>
            </div>

            <div class="features">
                <div class="feature">
                    <div class="feature-icon">🤖</div>
                    <h4>AI-Optimized</h4>
                    <p>Tailored by Gemini AI for maximum impact</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🎨</div>
                    <h4>Professional Design</h4>
                    <p>Clean, modern LaTeX formatting</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">📱</div>
                    <h4>ATS-Friendly</h4>
                    <p>Optimized for applicant tracking systems</p>
                </div>
            </div>

            <div class="latex-content" id="latexContent">${latexContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>

            <div class="actions">
                <button class="btn" onclick="copyLatexCode()">📋 Copy LaTeX Code</button>
            </div>
        </div>
    </div>

    <div class="copy-notification" id="copyNotification">
        ✅ LaTeX code copied to clipboard!
    </div>

    <script>
        function copyLatexCode() {
            const latexContent = \`${latexContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
            
            navigator.clipboard.writeText(latexContent).then(() => {
                showCopyNotification();
            }).catch(err => {
                console.error('Failed to copy with Clipboard API: ', err);
                // Fallback method
                fallbackCopy(latexContent);
            });
        }

        function fallbackCopy(text) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                showCopyNotification();
            } catch (err) {
                console.error('Fallback copy failed: ', err);
                alert('Copy failed. Please manually select and copy the LaTeX code.');
            }
            
            document.body.removeChild(textArea);
        }

        function showCopyNotification() {
            const notification = document.getElementById('copyNotification');
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        // Add some interactive effects
        document.addEventListener('DOMContentLoaded', function() {
            // Animate compiler cards on hover
            const cards = document.querySelectorAll('.compiler-card');
            cards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-5px) scale(1.02)';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                });
            });
        });
    </script>
</body>
</html>`;
}

// Handle any errors
chrome.runtime.onStartup.addListener(() => {
    console.log('Resume Tailor AI extension started');
});

// Clean up when extension is disabled/uninstalled
chrome.runtime.onSuspend.addListener(() => {
    console.log('Resume Tailor AI extension suspended');
});
