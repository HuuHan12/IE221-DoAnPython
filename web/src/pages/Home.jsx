import { useRef, useState } from "react";

import UploadSection from "../components/home/UploadSection";
import ResultCard from "../components/home/ResultCard";
import "../css/Home.css";

const API_URL = "http://127.0.0.1:8000";

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function Home() {
    const fileInputRef = useRef(null);

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dragging, setDragging] = useState(false);

    // ==========================================
    // FILE
    // ==========================================

    const handleFile = (selectedFile) => {
        if (!selectedFile) return;

        if (!ALLOWED_TYPES.includes(selectedFile.type)) {
            setError("Chỉ hỗ trợ JPG, PNG và WEBP.");
            return;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            setError("Ảnh không được lớn hơn 10MB.");
            return;
        }

        if (preview) {
            URL.revokeObjectURL(preview);
        }

        const imageUrl = URL.createObjectURL(selectedFile);

        setFile(selectedFile);
        setPreview(imageUrl);
        setResult(null);
        setError(null);
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0];

        if (selectedFile) {
            handleFile(selectedFile);
        }

        event.target.value = "";
    };

    // ==========================================
    // DRAG & DROP
    // ==========================================

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setDragging(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (event.currentTarget === event.target) {
            setDragging(false);
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setDragging(false);

        const droppedFile = event.dataTransfer.files?.[0];

        if (droppedFile) {
            handleFile(droppedFile);
        }
    };

    // ==========================================
    // PREDICT
    // ==========================================

    const handlePredict = async () => {
        if (!file) {
            setError("Vui lòng chọn ảnh trước.");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();

            formData.append("image", file);

            const response = await fetch(`${API_URL}/predict`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Không thể nhận diện hình ảnh."
                );
            }

            if (!data.prediction) {
                throw new Error(
                    "API không trả về kết quả nhận diện."
                );
            }

            setResult(data);

        } catch (err) {
            console.error(err);

            setError(
                err.message || "Có lỗi xảy ra khi nhận diện."
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // REMOVE
    // ==========================================

    const handleRemove = () => {
        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setFile(null);
        setPreview(null);
        setResult(null);
        setError(null);
    };

    // ==========================================
    // SHARE
    // ==========================================

    const handleShare = async () => {
        const prediction = result?.prediction;

        if (!prediction) return;

        const shareData = {
            title: prediction.name || "LandmarkAI",
            text: `Địa danh được nhận diện: ${prediction.name}`,
            url: prediction.gmaps_url,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(
                    prediction.gmaps_url
                );

                alert("Đã sao chép liên kết Google Maps.");
            }
        } catch {
            console.log("Share cancelled.");
        }
    };

    return (
        <main className="home">

            {/* HERO */}

            <section className="hero">

                <h1>
                    AI Search Engine
                </h1>

                <p>
                    Tìm kiếm và nhận diện địa danh nổi tiếng
                    bằng trí tuệ nhân tạo
                </p>

            </section>


            {/* UPLOAD */}

            <UploadSection
                file={file}
                dragging={dragging}
                loading={loading}
                fileInputRef={fileInputRef}
                onFileChange={handleFileChange}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onRemove={handleRemove}
                onPredict={handlePredict}
            />


            {/* ERROR */}

            {error && (
                <div className="error">
                    ⚠ &nbsp; {error}
                </div>
            )}


            {/* RESULT */}

            {result?.prediction && (
                <ResultCard
                    result={result}
                    preview={preview}
                    onShare={handleShare}
                />
            )}

        </main>
    );
}

export default Home;