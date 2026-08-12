import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10 MB.");
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setError(null);

    const imageUrl = URL.createObjectURL(selectedFile);
    setPreview(imageUrl);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    handleFile(selectedFile);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragging(false);

    const droppedFile = event.dataTransfer.files[0];

    handleFile(droppedFile);
  };

  const handlePredict = async () => {
    if (!file) {
      setError("Please choose an image first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Prediction failed.");
      }

      setResult(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">

      {/* Navbar */}

      <header className="navbar">
        <div className="logo">
          Viet<span>Landmark</span>
        </div>

        <nav>
          <a href="#">Home</a>
          <a href="#">History</a>
          <a href="#">About</a>
        </nav>
      </header>


      {/* Hero */}

      <main className="main">

        <section className="hero">

          <div className="hero-badge">
            🇻🇳 AI LANDMARK RECOGNITION
          </div>

          <h1>
            Discover Vietnam
          </h1>

          <p>
            Identify Vietnamese landmarks from a single photo
            using artificial intelligence.
          </p>

        </section>


        {/* Upload */}

        <section className="upload-section">

          <label
            className={`upload-box ${dragging ? "dragging" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="preview-image"
              />
            ) : (
              <>
                <div className="upload-icon">
                  ↑
                </div>

                <h3>
                  {dragging
                    ? "Drop your image here"
                    : "Upload an image"}
                </h3>

                <p>
                  {dragging
                    ? "Release to upload"
                    : "Drag & drop or click to choose a photo"}
                </p>
              </>
            )}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
            />

          </label>


          {file && (
            <div className="file-info">
              <span>{file.name}</span>

              <span>
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          )}


          <button
            className="analyze-button"
            onClick={handlePredict}
            disabled={!file || loading}
          >
            {loading
              ? "Analyzing..."
              : "Analyze Landmark →"}
          </button>


          <div className="supported">
            JPG · PNG · WEBP &nbsp; • &nbsp; Max 10 MB
          </div>

        </section>


        {/* Error */}

        {error && (
          <div className="error">
            {error}
          </div>
        )}


        {/* Result */}

        {result && (
          <section className="result-section">

            <div className="result-header">
              <span>
                AI RECOGNITION RESULT
              </span>
            </div>

            <h2>
              {result.landmark}
            </h2>

            <div className="confidence">
              {(result.confidence * 100).toFixed(1)}%
            </div>

            <p className="confidence-label">
              Confidence
            </p>


            <div className="result-details">

              <div>
                <span>File</span>
                <strong>
                  {result.filename}
                </strong>
              </div>

              <div>
                <span>Size</span>
                <strong>
                  {result.size}
                </strong>
              </div>

              <div>
                <span>Format</span>
                <strong>
                  {result.content_type}
                </strong>
              </div>

            </div>

          </section>
        )}

      </main>

    </div>
  );
}

export default App
