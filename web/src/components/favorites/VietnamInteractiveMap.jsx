import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Maximize2, Plus, Minus, Target } from "lucide-react";

function VietnamInteractiveMap({ landmarks, activeLandmark, onSelectLandmark }) {
    const mapRef = useRef(null);
    const leafletInstanceRef = useRef(null);
    const markersRef = useRef({});

    useEffect(() => {
        if (!mapRef.current) return;

        // Initialize Leaflet map centered on Vietnam
        if (!leafletInstanceRef.current) {
            const map = L.map(mapRef.current, {
                center: [15.8700, 108.2000],
                zoom: 6,
                zoomControl: false, // Custom controls
                attributionControl: false
            });

            // OpenStreetMap tile layer
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 18,
                subdomains: ["a", "b", "c"]
            }).addTo(map);

            leafletInstanceRef.current = map;
        }

        const map = leafletInstanceRef.current;

        // Clear previous markers
        Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
        markersRef.current = {};

        // Render markers for landmarks
        landmarks.forEach((item) => {
            if (!item.coords) return;

            const isSelected = activeLandmark?.id === item.id;

            // Custom HTML Leaflet DivIcon matching mockup teal pin with text
            const iconHtml = `
                <div className="custom-leaflet-pin-wrapper ${isSelected ? "selected" : ""}">
                    <div className="pin-body">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFFFFF" stroke-width="2.5">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                            <circle cx="12" cy="9" r="3" fill="#FFFFFF"/>
                        </svg>
                    </div>
                    <span className="pin-label-name">${item.shortName || item.name}</span>
                </div>
            `;

            const customIcon = L.divIcon({
                html: iconHtml,
                className: "custom-leaflet-div-icon",
                iconSize: [40, 50],
                iconAnchor: [20, 45]
            });

            const marker = L.marker([item.coords.lat, item.coords.lng], { icon: customIcon }).addTo(map);

            const popupHtml = `
                <div style="font-family: inherit; width: 190px; text-align: left; padding: 2px;">
                    <img src="${item.url || "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&auto=format&fit=crop"}" alt="${item.name}" style="width: 100%; height: 95px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;" onerror="this.src='https://images.unsplash.com/photo-1528127269322-539801943592?w=800&auto=format&fit=crop'" />
                    <strong style="font-size: 13px; color: #0f172a; display: block; line-height: 1.3;">${item.name}</strong>
                    <span style="font-size: 11px; color: #009080; display: block; margin-top: 3px; font-weight: 500;">📍 ${item.province || "Việt Nam"}</span>
                    ${item.address ? `<span style="font-size: 10px; color: #94a3b8; display: block; margin-top: 2px;">${item.address}</span>` : ""}
                </div>
            `;
            marker.bindPopup(popupHtml, { offset: [0, -35] });

            marker.on("click", () => {
                onSelectLandmark(item);
                marker.openPopup();
                map.flyTo([item.coords.lat, item.coords.lng], 9, { duration: 1.2 });
            });

            markersRef.current[item.id] = marker;
        });
    }, [landmarks, activeLandmark, onSelectLandmark]);

    // Fly map to active landmark when changed via card click and open popup
    useEffect(() => {
        if (activeLandmark?.coords && leafletInstanceRef.current) {
            leafletInstanceRef.current.flyTo(
                [activeLandmark.coords.lat, activeLandmark.coords.lng],
                9,
                { duration: 1.2 }
            );
            const targetMarker = markersRef.current[activeLandmark.id];
            if (targetMarker) {
                targetMarker.openPopup();
            }
        }
    }, [activeLandmark]);

    const handleZoomIn = () => {
        if (leafletInstanceRef.current) leafletInstanceRef.current.zoomIn();
    };

    const handleZoomOut = () => {
        if (leafletInstanceRef.current) leafletInstanceRef.current.zoomOut();
    };

    const handleResetCenter = () => {
        if (leafletInstanceRef.current) {
            leafletInstanceRef.current.flyTo([15.8700, 108.2000], 6, { duration: 1 });
        }
    };

    return (
        <div className="map-panel-card">
            <div className="map-panel-header">
                <h3 className="map-panel-title">Bản đồ yêu thích</h3>
                <button
                    type="button"
                    className="map-fullscreen-btn"
                    onClick={handleResetCenter}
                    title="Căn giữa Việt Nam / Mở rộng"
                >
                    <Maximize2 size={16} color="#6B7280" />
                </button>
            </div>

            <div className="leaflet-map-canvas-container">
                <div ref={mapRef} className="leaflet-map-canvas" />

                {/* Map Control Buttons Overlay */}
                <div className="map-controls-group">
                    <button
                        type="button"
                        className="map-ctrl-btn"
                        onClick={handleResetCenter}
                        title="Định vị Việt Nam"
                    >
                        <Target size={16} color="#009080" />
                    </button>
                    <div className="map-ctrl-zoom-stack">
                        <button type="button" className="map-ctrl-btn" onClick={handleZoomIn} title="Phóng to">
                            <Plus size={16} color="#4B5563" />
                        </button>
                        <button type="button" className="map-ctrl-btn" onClick={handleZoomOut} title="Thu nhỏ">
                            <Minus size={16} color="#4B5563" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="map-panel-footer">
                <div className="map-footer-info">
                    <span className="footer-count-badge">{landmarks.length} địa danh trong bộ sưu tập</span>
                    <span className="footer-sub-link">Khám phá lại những nơi bạn yêu thích trên bản đồ &gt;</span>
                </div>
            </div>
        </div>
    );
}

export default VietnamInteractiveMap;
