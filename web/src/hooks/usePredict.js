import { useState, useRef, useCallback } from "react";
import { SAMPLE_PRESETS } from "../mocks/mockLandmarks";
import { predictLandmarkApi, selectLocationApi } from "../service/predictService";

export function usePredict() {
    const fileInputRef = useRef(null);

    // Navigation & Configuration States
    const [activeTab, setActiveTab] = useState("predict");
    const [dataSource, setDataSource] = useState("expanded");
    const [topK, setTopK] = useState(5);
    const [selectedSample, setSelectedSample] = useState("");

    // File & Prediction States
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [selectedPredictionIndex, setSelectedPredictionIndex] = useState(0);
    const [selectedPrediction, setSelectedPrediction] = useState(null);
    const [selectedGisError, setSelectedGisError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [groundTruth, setGroundTruth] = useState({ lat: "", lon: "" });

    // Handle File Selection
    const handleFile = useCallback((selectedFile) => {
        if (!selectedFile) return;

        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (!allowed.includes(selectedFile.type)) {
            setError("Chỉ hỗ trợ file định dạng JPG, PNG và WEBP.");
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setError("Kích thước file ảnh không được vượt quá 10MB.");
            return;
        }

        const objectUrl = URL.createObjectURL(selectedFile);
        setFile(selectedFile);
        setPreview(objectUrl);
        setResult(null);
        setSelectedPredictionIndex(0);
        setSelectedPrediction(null);
        setSelectedGisError(null);
        setError(null);
        setSelectedSample("");
    }, []);

    const handleFileChange = useCallback((e) => {
        const selected = e.target.files?.[0];
        if (selected) handleFile(selected);
        e.target.value = "";
    }, [handleFile]);

    // Drag and Drop
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) handleFile(droppedFile);
    }, [handleFile]);

    // Sample Preset Selection
    const handleSelectSample = useCallback(async (presetId) => {
        if (!presetId) {
            setFile(null);
            setPreview(null);
            setResult(null);
            setSelectedPredictionIndex(0);
            setSelectedPrediction(null);
            setSelectedGisError(null);
            setSelectedSample("");
            setGroundTruth({ lat: "", lon: "" });
            return;
        }

        const sample = SAMPLE_PRESETS.find((p) => p.id === presetId);
        if (!sample) return;

        setSelectedSample(sample.id);
        setPreview(sample.image);
        setGroundTruth({
            lat: sample.lat ? String(sample.lat) : "",
            lon: sample.lon ? String(sample.lon) : "",
        });
        setError(null);
        setResult(null);
        setSelectedPredictionIndex(0);
        setSelectedPrediction(null);
        setSelectedGisError(null);

        try {
            const res = await fetch(sample.image);
            const blob = await res.blob();
            const sampleFile = new File([blob], `${sample.id}.jpg`, { type: "image/jpeg" });
            setFile(sampleFile);
        } catch {
            setFile({ name: `${sample.name}.jpg`, size: 1024 * 500, type: "image/jpeg" });
        }
    }, []);

    // Perform Real AI Prediction via FastAPI Backend with Library GIS Error Metrics
    const handlePredict = useCallback(async () => {
        if (!file && !preview) {
            setError("Vui lòng chọn hoặc tải lên một file ảnh trước.");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);
        setSelectedPredictionIndex(0);
        setSelectedPrediction(null);
        setSelectedGisError(null);

        try {
            let fileToSend = file;

            if (!(fileToSend instanceof File) && preview) {
                const res = await fetch(preview);
                const blob = await res.blob();
                fileToSend = new File([blob], "input_image.jpg", { type: blob.type || "image/jpeg" });
            }

            // Real AI Prediction & Geodesic Distance Error Call from Python
            const data = await predictLandmarkApi(fileToSend, topK, dataSource, groundTruth);
            setResult(data);
            setSelectedPredictionIndex(0);
            setSelectedPrediction(data.prediction);
            setSelectedGisError(data.gis_error);

        } catch (err) {
            console.error("[GeoCLIP AI Prediction Error]", err);
            setError(err.message || "Không thể kết nối đến máy chủ AI. Vui lòng kiểm tra backend.");
        } finally {
            setLoading(false);
        }
    }, [file, preview, topK, dataSource, groundTruth]);

    // Handle Selection of any Item from Top-K via Python Backend API
    const handleSelectPrediction = useCallback(async (index) => {
        if (!result?.predictions || !result.predictions[index]) return;
        const item = result.predictions[index];
        setSelectedPredictionIndex(index);

        try {
            // Call Python backend to recompute metrics for this selected location
            const data = await selectLocationApi(item, groundTruth);
            setSelectedPrediction(data.prediction);
            setSelectedGisError(data.gis_error);
        } catch (err) {
            console.error("[Select Location Error]", err);
            // Fallback to client item if server fails
            setSelectedPrediction(item);
        }
    }, [result, groundTruth]);

    const handleRemove = useCallback(() => {
        setFile(null);
        setPreview(null);
        setResult(null);
        setSelectedPredictionIndex(0);
        setSelectedPrediction(null);
        setSelectedGisError(null);
        setError(null);
        setSelectedSample("");
        setGroundTruth({ lat: "", lon: "" });
    }, []);

    const handleShare = useCallback(async () => {
        const activePred = selectedPrediction || result?.prediction;
        if (!activePred) return;
        const gmapsUrl =
            activePred.gmaps_url ||
            `https://www.google.com/maps?q=${activePred.lat},${activePred.lon}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: activePred.name || result?.landmark || "LandmarkAI",
                    text: `Nhận diện vị trí: ${activePred.name || result?.landmark}`,
                    url: gmapsUrl,
                });
            } catch {
                console.log("Share cancelled");
            }
        } else {
            await navigator.clipboard.writeText(gmapsUrl);
            alert("✓ Đã sao chép liên kết Google Maps vào clipboard!");
        }
    }, [result, selectedPrediction]);

    return {
        fileInputRef,
        activeTab,
        setActiveTab,
        dataSource,
        setDataSource,
        topK,
        setTopK,
        selectedSample,
        handleSelectSample,
        file,
        preview,
        result,
        selectedPredictionIndex,
        selectedPrediction: selectedPrediction || result?.prediction || null,
        selectedGisError: selectedGisError ?? result?.gis_error ?? null,
        handleSelectPrediction,
        loading,
        error,
        setError,
        dragging,
        groundTruth,
        setGroundTruth,
        handleFileChange,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handlePredict,
        handleRemove,
        handleShare,
        samplePresets: SAMPLE_PRESETS,
    };
}
