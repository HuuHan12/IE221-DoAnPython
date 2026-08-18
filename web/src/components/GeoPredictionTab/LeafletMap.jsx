import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../css/LeafletMap.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const redIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const blueIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const tealIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [20, 32],
    iconAnchor: [10, 32],
    popupAnchor: [1, -28],
    shadowSize: [32, 32],
});

function LeafletMap({
    predictions = [],
    groundTruth = null,
    distanceKm = null,
    selectedPrediction = null,
}) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersLayerRef = useRef(null);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        if (!mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current, {
                center: [16.047079, 107.5],
                zoom: 6,
                zoomControl: true,
            });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(map);

            mapInstanceRef.current = map;
            markersLayerRef.current = L.layerGroup().addTo(map);
        }

        const map = mapInstanceRef.current;
        const layerGroup = markersLayerRef.current;
        layerGroup.clearLayers();

        const latLngBounds = [];

        const hasGt =
            groundTruth &&
            groundTruth.lat !== "" &&
            groundTruth.lon !== "" &&
            !isNaN(Number(groundTruth.lat)) &&
            !isNaN(Number(groundTruth.lon));

        let gtLatLng = null;
        if (hasGt) {
            const gtLat = Number(groundTruth.lat);
            const gtLon = Number(groundTruth.lon);
            gtLatLng = [gtLat, gtLon];
            latLngBounds.push(gtLatLng);

            const gtMarker = L.marker(gtLatLng, { icon: redIcon }).addTo(layerGroup);
            gtMarker.bindPopup(`
                <div style="font-family: inherit; font-size: 13px; line-height: 1.4;">
                    <strong style="color: #DC2626;">🎯 Tọa độ thực tế (Ground Truth)</strong><br/>
                    Vĩ độ: ${gtLat.toFixed(6)}°<br/>
                    Kinh độ: ${gtLon.toFixed(6)}°
                </div>
            `);
        }

        let activeTargetLatLng = null;
        const activeTarget = selectedPrediction || (predictions.length > 0 ? predictions[0] : null);

        if (Array.isArray(predictions) && predictions.length > 0) {
            predictions.forEach((item, index) => {
                const lat = Number(item.lat);
                const lon = Number(item.lon);
                if (isNaN(lat) || isNaN(lon)) return;

                const latLng = [lat, lon];
                latLngBounds.push(latLng);

                const isSelected = activeTarget && (
                    (activeTarget.lat === item.lat && activeTarget.lon === item.lon) ||
                    (activeTarget.name && activeTarget.name === item.name)
                );

                if (isSelected) {
                    activeTargetLatLng = latLng;
                }

                const marker = L.marker(latLng, {
                    icon: isSelected ? blueIcon : tealIcon,
                    zIndexOffset: isSelected ? 1000 : 500 - index,
                }).addTo(layerGroup);

                marker.bindPopup(`
                    <div style="font-family: inherit; font-size: 13px; line-height: 1.4;">
                        <strong style="color: #009080;">${item.rank ? `Hạng #${item.rank}: ` : `Top ${index + 1}: `}</strong>
                        <strong>${item.name || "Địa danh"}</strong><br/>
                        <em>${item.province || "Việt Nam"}</em><br/>
                        Tọa độ: ${lat.toFixed(6)}°, ${lon.toFixed(6)}°<br/>
                        Xác suất: <strong>${item.prob_percent || 0}%</strong><br/>
                        <a href="${item.gmaps_url || `https://www.google.com/maps?q=${lat},${lon}`}" target="_blank" rel="noopener noreferrer" style="color: #009080; font-weight: 600; text-decoration: underline;">
                            Xem trên Google Maps ↗
                        </a>
                    </div>
                `);

                if (isSelected && !hasGt) {
                    marker.openPopup();
                }
            });
        }

        // Vẽ đường nét đứt đo khoảng cách từ Ground Truth đến Target đang được chọn
        if (gtLatLng && activeTargetLatLng) {
            L.polyline([gtLatLng, activeTargetLatLng], {
                color: "#DC2626",
                weight: 3,
                dashArray: "6, 8",
                opacity: 0.85,
            }).addTo(layerGroup);

            if (distanceKm !== null) {
                const midLat = (gtLatLng[0] + activeTargetLatLng[0]) / 2;
                const midLon = (gtLatLng[1] + activeTargetLatLng[1]) / 2;
                const distText = distanceKm < 1 ? `${(distanceKm * 1000).toFixed(0)} m` : `${distanceKm.toFixed(2)} km`;

                L.tooltip({
                    permanent: true,
                    direction: "center",
                    className: "distance-map-tooltip",
                })
                    .setLatLng([midLat, midLon])
                    .setContent(`📏 Sai số: <strong>${distText}</strong>`)
                    .addTo(layerGroup);
            }
        }

        if (latLngBounds.length > 0) {
            if (latLngBounds.length === 1) {
                map.setView(latLngBounds[0], 13);
            } else {
                map.fitBounds(latLngBounds, { padding: [40, 40], maxZoom: 15 });
            }
        } else {
            map.setView([16.047079, 107.5], 6);
        }

        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 150);

        return () => clearTimeout(timer);
    }, [predictions, groundTruth, distanceKm, selectedPrediction]);

    return (
        <div className="leaflet-map-wrapper">
            <div ref={mapContainerRef} className="leaflet-map-container" />
        </div>
    );
}

export default React.memo(LeafletMap);
