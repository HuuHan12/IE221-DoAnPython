import "../../css/ResultCard.css";

function ResultCard({
    result,
    preview,
    onShare,
}) {
    const prediction = result.prediction;

    const {
        name,
        category,
        province,
        description,
        lat,
        lon,
        prob_percent,
        gmaps_url,
    } = prediction;

    const confidence =
        Number(result.confidence ?? 0) * 100;

    const probability =
        Number(prob_percent ?? confidence);


    // ==========================================
    // GOOGLE MAP EMBED
    // ==========================================

    const mapUrl =
        `https://www.google.com/maps?q=${lat},${lon}` +
        `&z=15&output=embed`;


    return (
        <section className="result-card">

            {/* TITLE */}

            <div className="result-title">
                <span>✧</span>
                Kết quả nhận diện
            </div>


            <div className="result-content">

                {/* IMAGE */}

                <div className="result-image-container">

                    <img
                        src={preview}
                        alt={name}
                        className="result-image"
                    />

                </div>


                {/* INFO */}

                <div className="result-info">

                    {/* HEADER */}

                    <div className="result-header">

                        <div className="location-info">

                            <span className="label">
                                Tên địa danh (dự đoán)
                            </span>

                            <h2>
                                {name || result.landmark}
                            </h2>

                            <p>
                                {province || "Việt Nam"}
                            </p>

                        </div>


                        {/* CONFIDENCE */}

                        <div className="confidence-container">

                            <div className="confidence-text">

                                <span>
                                    Độ tin cậy
                                </span>

                                <strong>
                                    {confidence.toFixed(0)}%
                                </strong>

                            </div>

                            <div
                                className="confidence-circle"
                                style={{
                                    "--confidence":
                                        `${confidence}%`
                                }}
                            >
                                <div />
                            </div>

                        </div>

                    </div>


                    <div className="divider" />


                    {/* GPS */}

                    <div className="info-row">

                        <span className="info-icon">
                            ⌖
                        </span>

                        <div>

                            <span>
                                Tọa độ (GPS)
                            </span>

                            <strong>
                                {Number(lat).toFixed(6)}° N,{" "}
                                {Number(lon).toFixed(6)}° E
                            </strong>

                        </div>

                    </div>


                    {/* CATEGORY */}

                    <div className="info-row">

                        <span className="info-icon">
                            ▣
                        </span>

                        <div>

                            <span>
                                Loại địa danh
                            </span>

                            <strong>
                                {category || "Địa danh"}
                            </strong>

                        </div>

                    </div>


                    {/* DESCRIPTION */}

                    {description && (
                        <div className="description">
                            {description}
                        </div>
                    )}


                    {/* MAP */}

                    <div className="map-section">

                        <div className="map-title">
                            <span>⌖</span>
                            Vị trí trên bản đồ
                        </div>

                        <div className="map-wrapper">

                            <iframe
                                title={`Bản đồ ${name}`}
                                src={mapUrl}
                                className="map"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />

                        </div>

                        <a
                            href={gmaps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="google-map-link"
                        >
                            Mở trên Google Maps ↗
                        </a>

                    </div>

                </div>

            </div>


            {/* EXTRA INFO */}

            <div className="result-details">

                <div>

                    <span>◉</span>

                    <div>

                        <small>
                            Tên file
                        </small>

                        <strong>
                            {result.filename}
                        </strong>

                    </div>

                </div>


                <div>

                    <span>▣</span>

                    <div>

                        <small>
                            Kích thước
                        </small>

                        <strong>
                            {result.size}
                        </strong>

                    </div>

                </div>


                <div>

                    <span>◈</span>

                    <div>

                        <small>
                            Định dạng
                        </small>

                        <strong>
                            {result.content_type}
                        </strong>

                    </div>

                </div>

            </div>


            {/* ACTIONS */}

            <div className="result-actions">

                <button
                    type="button"
                    className="favorite-button"
                >
                    ♡ &nbsp; Thêm vào Yêu thích
                </button>

                <button
                    type="button"
                    className="share-button"
                    onClick={onShare}
                >
                    ⤴ &nbsp; Chia sẻ
                </button>

            </div>

        </section>
    );
}

export default ResultCard;