import "../../css/UploadSection.css";
function UploadSection({
    file,
    dragging,
    loading,
    fileInputRef,
    onFileChange,
    onDragOver,
    onDragLeave,
    onDrop,
    onRemove,
    onPredict,
}) {
    return (
        <section className="upload-section">

            <div
                className={`upload-box ${
                    dragging ? "dragging" : ""
                }`}
                onDragOver={onDragOver}
                onDragEnter={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
            >

                <div className="upload-icon">
                    ↑
                </div>

                <h2>
                    {dragging
                        ? "Thả ảnh vào đây"
                        : "Kéo & thả ảnh vào đây"}
                </h2>

                <div className="or">
                    hoặc
                </div>

                <button
                    type="button"
                    className="choose-button"
                    onClick={(event) => {
                        event.stopPropagation();
                        fileInputRef.current?.click();
                    }}
                >
                    ↑ &nbsp; Chọn ảnh từ thiết bị
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={onFileChange}
                    hidden
                />

                <p>
                    Hỗ trợ JPG, PNG, WEBP (tối đa 10MB)
                </p>

            </div>


            {/* SELECTED FILE */}

            {file && (
                <div className="selected-file">

                    <div className="selected-file-info">

                        <span className="file-icon">
                            ◉
                        </span>

                        <div>

                            <strong>
                                {file.name}
                            </strong>

                            <span>
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </span>

                        </div>

                    </div>

                    <button
                        type="button"
                        className="remove-file"
                        onClick={onRemove}
                    >
                        ×
                    </button>

                </div>
            )}


            {/* PREDICT */}

            {file && (
                <button
                    type="button"
                    className="recognize-button"
                    onClick={onPredict}
                    disabled={loading}
                >
                    {loading
                        ? "Đang nhận diện..."
                        : "✦ Nhận diện địa danh"}
                </button>
            )}

        </section>
    );
}

export default UploadSection;