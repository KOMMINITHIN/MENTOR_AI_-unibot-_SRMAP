"use client";

import { useState, useRef } from "react";
import { Upload, File, Image, FileText, Code, X, Loader2, MessageSquare } from "lucide-react";
import "./FileUpload.css";

const BACKEND_URL = "http://localhost:8000";

interface FileUploadProps {
  onFileAnalyzed: (analysis: any) => void;
  user: any;
}

interface UploadedFile {
  id: number;
  filename: string;
  content_type: string;
  analysis: any;
  full_content: string;
}

export default function FileUpload({ onFileAnalyzed, user }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = [
    "PDF", "DOCX", "TXT", "MD",
    "PNG", "JPG", "JPEG", "GIF", "BMP", "TIFF",
    "PY", "JS", "HTML", "CSS", "JAVA", "CPP", "C",
    "XLSX", "CSV", "JSON"
  ];

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'].includes(ext || '')) {
      return <Image size={20} />;
    } else if (['py', 'js', 'html', 'css', 'java', 'cpp', 'c'].includes(ext || '')) {
      return <Code size={20} />;
    } else {
      return <FileText size={20} />;
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Set file size limits based on authentication
    const maxSize = user ? 10 * 1024 * 1024 : 2 * 1024 * 1024; // 10MB for users, 2MB for guests
    const maxSizeMB = user ? "10MB" : "2MB";

    if (file.size > maxSize) {
      const signupMsg = user ? "" : " Sign up for 10MB limit!";
      alert(`File too large. Maximum size is ${maxSizeMB}.${signupMsg}`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      const headers: any = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        headers,
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        const newFile: UploadedFile = {
          id: result.file_id,
          filename: result.filename,
          content_type: result.analysis.content_type,
          analysis: result.analysis,
          full_content: result.full_content
        };

        setUploadedFiles(prev => [...prev, newFile]);
        
        // Auto-analyze the file
        await analyzeFile(newFile, "Please analyze this file and provide insights.");
        
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const analyzeFile = async (file: UploadedFile, question: string = "Analyze this file") => {
    setAnalyzing(true);

    try {
      const token = localStorage.getItem("token");
      const headers: any = {
        "Content-Type": "application/json"
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${BACKEND_URL}/analyze-file`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          file_content: file.full_content,
          question: question,
          file_type: file.content_type
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Send analysis to chat
        onFileAnalyzed({
          filename: file.filename,
          analysis: result.analysis,
          file_type: file.content_type,
          model_used: result.model_used
        });
        
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Analysis failed");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const removeFile = (fileId: number) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const askQuestion = (file: UploadedFile) => {
    const question = prompt("What would you like to know about this file?");
    if (question) {
      analyzeFile(file, question);
    }
  };

  return (
    <div className="file-upload-container">
      {/* Upload Area */}
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInput}
          style={{ display: 'none' }}
          accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.gif,.bmp,.tiff,.py,.js,.html,.css,.java,.cpp,.c,.xlsx,.csv,.json"
        />
        
        {uploading ? (
          <div className="upload-status">
            <Loader2 className="spinner" size={32} />
            <p>Processing file...</p>
          </div>
        ) : (
          <div className="upload-content">
            <Upload size={32} />
            <h3>Upload Files for AI Analysis</h3>
            <p>Drag & drop or click to upload</p>
            <div className="supported-formats">
              <small>Supported: {supportedFormats.join(", ")}</small>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <h4>📁 Uploaded Files</h4>
          {uploadedFiles.map((file) => (
            <div key={file.id} className="file-item">
              <div className="file-info">
                {getFileIcon(file.filename)}
                <div className="file-details">
                  <span className="filename">{file.filename}</span>
                  <span className="file-type">{file.analysis.summary}</span>
                </div>
              </div>
              <div className="file-actions">
                <button
                  type="button"
                  onClick={() => askQuestion(file)}
                  className="ask-btn"
                  disabled={analyzing}
                >
                  <MessageSquare size={16} />
                  Ask
                </button>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="remove-btn"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {analyzing && (
        <div className="analyzing-status">
          <Loader2 className="spinner" size={16} />
          <span>AI is analyzing your file...</span>
        </div>
      )}
    </div>
  );
}
