# 🎯 Resume Tailor AI - Chrome Extension

A powerful Chrome extension that uses Gemini AI to automatically tailor your LaTeX resume for specific job descriptions, then helps you compile it to PDF using online LaTeX compilers.

## ✨ Features

- **AI-Powered Resume Tailoring**: Uses Google's Gemini AI to intelligently modify your resume content to match job descriptions
- **LaTeX Support**: Maintains professional LaTeX formatting while optimizing content
- **One-Click Compilation**: Seamlessly integrates with online LaTeX compilers like Overleaf
- **Secure Storage**: Safely stores your API keys locally in Chrome
- **Modern UI**: Beautiful, intuitive interface with gradient design
- **Copy & Edit**: Easy copying of tailored LaTeX code with editing capabilities

## 🚀 Quick Start

### 1. Installation

1. **Download/Clone** this repository to your local machine
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top-right corner)
4. **Click "Load unpacked"** and select the `resume-tailor-extension` folder
5. **Pin the extension** to your toolbar for easy access

### 2. Setup

1. **Get a Gemini API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key

2. **Configure the Extension**:
   - Click the Resume Tailor AI icon in your Chrome toolbar
   - Paste your Gemini API key and click "Save"
   - Load the default template or paste your own LaTeX resume

### 3. Usage

1. **Find a Job**: Copy the job description you want to tailor your resume for
2. **Open the Extension**: Click the Resume Tailor AI icon
3. **Paste Job Description**: Add the job posting details
4. **Tailor Resume**: Click "🚀 Tailor Resume" and wait for AI processing
5. **Compile to PDF**: Click "📥 Download PDF" to open the LaTeX compiler
6. **Get Your Resume**: Copy the code to Overleaf and compile to PDF

## 🛠️ How It Works

### AI Processing Flow
1. **Input Analysis**: Gemini AI analyzes both your resume and the job description
2. **Content Optimization**: AI identifies relevant skills, experiences, and keywords
3. **LaTeX Generation**: Creates a tailored version while preserving formatting
4. **Quality Assurance**: Maintains document structure and professional appearance

### Technical Architecture
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Chrome Extension APIs, Service Workers
- **AI Integration**: Google Gemini Pro API
- **Storage**: Chrome Local Storage API
- **Compilation**: Integration with online LaTeX services

## 📋 Requirements

- **Chrome Browser**: Version 88+ (Manifest V3 support)
- **Gemini API Key**: Free from Google AI Studio
- **Internet Connection**: Required for AI processing
- **LaTeX Compiler**: Overleaf, LaTeX Base, or similar online service

## 🔧 Configuration

### API Key Setup
```javascript
// The extension securely stores your API key locally
chrome.storage.local.set({ geminiApiKey: 'your-api-key-here' });
```

### Custom Resume Template
Replace the default template with your own LaTeX resume by:
1. Opening the extension popup
2. Clearing the "Resume Template" field
3. Pasting your custom LaTeX code
4. Using the extension normally

## 📁 Project Structure

```
resume-tailor-extension/
├── manifest.json          # Extension configuration
├── popup.html             # Main UI interface
├── popup.css              # Styling and animations
├── popup.js               # Core functionality
├── background.js          # Service worker
├── icons/                 # Extension icons
│   ├── icon16.svg
│   ├── icon48.svg
│   └── icon128.svg
└── README.md              # This file
```

## 🎨 Customization

### Styling
Edit `popup.css` to customize the appearance:
- Color schemes
- Button styles
- Layout adjustments
- Animation effects

### AI Prompts
Modify the prompt in `popup.js` to change how the AI processes resumes:
```javascript
const prompt = `Your custom instructions for Gemini AI...`;
```

## 🔒 Privacy & Security

- **Local Storage**: API keys are stored locally in Chrome, never transmitted to third parties
- **No Data Collection**: The extension doesn't collect or store personal information
- **Secure Communication**: All API calls use HTTPS encryption
- **User Control**: You can delete stored data anytime through Chrome settings

## 🐛 Troubleshooting

### Common Issues

**Extension won't load**
- Ensure Developer Mode is enabled in Chrome
- Check that all files are in the correct directory structure

**API calls failing**
- Verify your Gemini API key is correct and active
- Check your internet connection
- Ensure the API key has proper permissions

**PDF compilation issues**
- Make sure to copy the complete LaTeX code
- Use a reliable online compiler like Overleaf
- Check for any LaTeX syntax errors in the output

### Debug Mode
Open Chrome DevTools (F12) while using the extension to see detailed error messages and logs.

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for powering the resume tailoring
- **Overleaf** for LaTeX compilation services
- **Chrome Extensions API** for the platform
- **Original LaTeX Template** by Jake Gutierrez

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Open an issue on GitHub
3. Review Chrome extension development docs

---

**Made with ❤️ for job seekers worldwide**

*Transform your resume for every opportunity with the power of AI!*
