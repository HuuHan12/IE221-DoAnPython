import { useState, useEffect } from "react";
import {
    Star,
    Lock,
    CheckCircle2,
    Loader2,
    Calendar,
    Sparkles,
    Trophy,
    Flame,
    Compass,
    Camera,
    BookOpen,
    Map,
    Info,
    X,
} from "lucide-react";
import { fetchMyAchievementsApi } from "../../service/achievementService";

function HexBadge({
    mainColor,
    darkColor,
    lightBorder,
    children,
    ribbonText,
    isLocked = false,
}) {
    return (
        <div className={`badge-svg-container ${isLocked ? "is-locked" : "is-unlocked"}`}>
            <svg viewBox="0 0 100 115" width="90" height="104" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id={`grad-${mainColor.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={isLocked ? "#94A3B8" : mainColor} />
                        <stop offset="100%" stopColor={isLocked ? "#475569" : darkColor} />
                    </linearGradient>
                    <filter id={`badge-shadow-${mainColor.replace('#', '')}`} x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor={isLocked ? "#334155" : darkColor} floodOpacity="0.3" />
                    </filter>
                </defs>

                {/* Outer Rounded Hexagon Shadow & Main Fill */}
                <path
                    d="M50 4 C53 4 56 5.5 58 7.5 L88 24.5 C92 27 94 30.5 94 35 L94 75 C94 79.5 92 83 88 85.5 L58 102.5 C56 104.5 53 106 50 106 C47 106 44 104.5 42 102.5 L12 85.5 C8 83 6 79.5 6 75 L6 35 C6 30.5 8 27 12 24.5 L42 7.5 C44 5.5 47 4 50 4 Z"
                    fill={`url(#grad-${mainColor.replace('#', '')})`}
                    filter={`url(#badge-shadow-${mainColor.replace('#', '')})`}
                />

                {/* Outer Double Outline Ring */}
                <path
                    d="M50 8 C52.5 8 55 9.2 56.5 11 L85 27 C88.5 29 90 32 90 36 L90 74 C90 78 88.5 81 85 83 L56.5 99 C55 100.8 52.5 102 50 102 C47.5 102 45 100.8 43.5 99 L15 83 C11.5 81 10 78 10 74 L10 36 C10 32 11.5 29 15 27 L43.5 11 C45 9.2 47.5 8 50 8 Z"
                    stroke={isLocked ? "rgba(255,255,255,0.2)" : (lightBorder || "rgba(255,255,255,0.4)")}
                    strokeWidth="2.5"
                    fill="none"
                />

                {/* Inner Decorative Hexagon Line */}
                <path
                    d="M50 14 C52 14 54 15 55 16.5 L81 31 C84 32.5 85 35 85 38 L85 72 C85 75 84 77.5 81 79 L55 93.5 C54 95 52 96 50 96 C48 96 46 95 45 93.5 L19 79 C16 77.5 15 75 15 72 L15 38 C15 35 16 32.5 19 31 L45 16.5 C46 15 48 14 50 14 Z"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="1.5"
                    fill="none"
                />

                {/* Laurel Wreath Leaves (Left & Right) */}
                <g fill="rgba(255,255,255,0.2)">
                    <path d="M26 48 C24 45 22 50 25 52 C27 51 28 49 26 48 Z" />
                    <path d="M24 57 C21 55 20 60 23 61 C25 60 26 58 24 57 Z" />
                    <path d="M25 66 C22 65 22 70 25 71 C27 69 27 67 25 66 Z" />
                    <path d="M74 48 C76 45 78 50 75 52 C73 51 72 49 74 48 Z" />
                    <path d="M76 57 C79 55 80 60 77 61 C75 60 74 58 76 57 Z" />
                    <path d="M75 66 C78 65 78 70 75 71 C73 69 73 67 75 66 Z" />
                </g>

                {/* Badge Center Graphic Content */}
                <g transform="translate(50, 48)">
                    {children}
                </g>

                {/* Ribbon Banner at Bottom */}
                {ribbonText && (
                    <g transform="translate(0, 74)">
                        <path d="M8 12 L16 4 L16 16 Z" fill={isLocked ? "#334155" : darkColor} filter="brightness(0.7)" />
                        <path d="M92 12 L84 4 L84 16 Z" fill={isLocked ? "#334155" : darkColor} filter="brightness(0.7)" />

                        <path d="M12 4 H88 L94 10 L88 16 H12 L6 10 L12 4 Z" fill={isLocked ? "#475569" : darkColor} />
                        <path d="M14 6 H86 L90 10 L86 14 H14 L10 10 L14 6 Z" fill="rgba(255,255,255,0.15)" />

                        <text
                            x="50"
                            y="13"
                            textAnchor="middle"
                            fill="#FFFFFF"
                            fontSize="8.5"
                            fontWeight="800"
                            letterSpacing="0.6"
                        >
                            {ribbonText}
                        </text>
                    </g>
                )}
            </svg>
        </div>
    );
}

// Cấu hình màu sắc và icon cho từng danh hiệu
const BADGE_VISUALS = {
    STREAK_1: {
        mainColor: "#4ADE80",
        darkColor: "#15803D",
        lightBorder: "#86EFAC",
        ribbonText: "1 NGÀY",
        renderIcon: () => (
            <g transform="translate(-16, -18)">
                <rect x="4" y="6" width="24" height="22" rx="4" fill="#FFFFFF" />
                <path d="M4 11 H28" stroke="#15803D" strokeWidth="2" />
                <circle cx="10" cy="4" r="1.5" fill="#FFFFFF" />
                <circle cx="22" cy="4" r="1.5" fill="#FFFFFF" />
                <circle cx="16" cy="18" r="6" fill="#22C55E" />
                <path d="M13 18 L15 20 L19 16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </g>
        ),
    },
    STREAK_7: {
        mainColor: "#3B82F6",
        darkColor: "#1D4ED8",
        lightBorder: "#93C5FD",
        ribbonText: "7 NGÀY",
        renderIcon: () => (
            <g transform="translate(-16, -18)">
                <rect x="4" y="6" width="24" height="22" rx="4" fill="#FFFFFF" />
                <path d="M4 11 H28" stroke="#1D4ED8" strokeWidth="2" />
                <circle cx="10" cy="4" r="1.5" fill="#FFFFFF" />
                <circle cx="22" cy="4" r="1.5" fill="#FFFFFF" />
                <text x="16" y="23" textAnchor="middle" fill="#1D4ED8" fontSize="11" fontWeight="800">7</text>
            </g>
        ),
    },
    STREAK_30: {
        mainColor: "#A78BFA",
        darkColor: "#6D28D9",
        lightBorder: "#C4B5FD",
        ribbonText: "30 NGÀY",
        renderIcon: () => (
            <g transform="translate(0, -2)">
                <text textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="900" letterSpacing="-0.5">30</text>
            </g>
        ),
    },
    CHECKIN_50: {
        mainColor: "#FB923C",
        darkColor: "#C2410C",
        lightBorder: "#FDBA74",
        ribbonText: "50 LẦN",
        renderIcon: () => (
            <g transform="translate(0, -2)">
                <text textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="900" letterSpacing="-0.5">50</text>
            </g>
        ),
    },
    CHECKIN_100: {
        mainColor: "#F472B6",
        darkColor: "#BE123C",
        lightBorder: "#F9A8D4",
        ribbonText: "100 LẦN",
        renderIcon: () => (
            <g transform="translate(0, -2)">
                <text textAnchor="middle" fill="#FFFFFF" fontSize="20" fontWeight="900" letterSpacing="-1">100</text>
            </g>
        ),
    },
    EXPLORER_10: {
        mainColor: "#2DD4BF",
        darkColor: "#0F766E",
        lightBorder: "#99F6E4",
        ribbonText: "EXPLORER",
        renderIcon: () => (
            <g transform="translate(0, -6)">
                <path
                    d="M0 -14 C-9 -14 -16 -7 -16 2 C-16 11 0 22 0 22 C0 22 16 11 16 2 C16 -7 9 -14 0 -14 Z"
                    fill="#FFFFFF"
                />
                <circle cx="0" cy="-2" r="5" fill="#0F766E" />
                <path d="M-8 24 H8" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            </g>
        ),
    },
    KING_WEEK: {
        mainColor: "#FBBF24",
        darkColor: "#B45309",
        lightBorder: "#FDE047",
        ribbonText: "VUA TUẦN",
        renderIcon: () => (
            <g transform="translate(0, -2)">
                <circle cx="-10" cy="-14" r="1.5" fill="#FFFFFF" />
                <circle cx="0" cy="-16" r="2" fill="#FFFFFF" />
                <circle cx="10" cy="-14" r="1.5" fill="#FFFFFF" />
                <path d="M-15 10 L-18 -6 L-9 0 L0 -10 L9 0 L18 -6 L15 10 Z" fill="#FFFFFF" />
                <rect x="-13" y="11" width="26" height="3" rx="1.5" fill="#FFFFFF" />
            </g>
        ),
    },
    FIRST_SCAN: {
        mainColor: "#06B6D4",
        darkColor: "#0891B2",
        lightBorder: "#67E8F9",
        ribbonText: "TẬP SỰ",
        renderIcon: () => (
            <g transform="translate(0, -2)">
                <path d="M0 -14 L4 -4 L14 0 L4 4 L0 14 L-4 4 L-14 0 L-4 -4 Z" fill="#FFFFFF" />
            </g>
        ),
    },
    FIVE_LANDMARKS: {
        mainColor: "#10B981",
        darkColor: "#047857",
        lightBorder: "#6EE7B7",
        ribbonText: "5 ĐỊA DANH",
        renderIcon: () => (
            <g transform="translate(0, -2)">
                <circle cx="0" cy="0" r="12" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
                <path d="M-6 6 L6 -6" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            </g>
        ),
    },
    PHOTO_MASTER: {
        mainColor: "#8B5CF6",
        darkColor: "#6D28D9",
        lightBorder: "#C4B5FD",
        ribbonText: "NHIẾP ẢNH",
        renderIcon: () => (
            <g transform="translate(0, -2)">
                <rect x="-12" y="-7" width="24" height="16" rx="3" fill="#FFFFFF" />
                <circle cx="0" cy="1" r="5" fill="#6D28D9" />
            </g>
        ),
    },
    HISTORY_BUFF: {
        mainColor: "#EC4899",
        darkColor: "#BE185D",
        lightBorder: "#F472B6",
        ribbonText: "LỊCH SỬ",
        renderIcon: () => (
            <g transform="translate(0, -2)">
                <path d="M-10 -8 H-2 V10 H-10 Z M2 -8 H10 V10 H2 Z" fill="#FFFFFF" />
            </g>
        ),
    },
    TRIP_PLANNER: {
        mainColor: "#F59E0B",
        darkColor: "#B45309",
        lightBorder: "#FCD34D",
        ribbonText: "KẾ HOẠCH",
        renderIcon: () => (
            <g transform="translate(0, -2)">
                <path d="M-10 -8 L-3 -5 L4 -8 L11 -5 V9 L4 6 L-3 9 L-10 6 Z" fill="#FFFFFF" />
            </g>
        ),
    },
};

function Achievements() {
    const [achievements, setAchievements] = useState([]);
    const [unlockedCount, setUnlockedCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [completionRate, setCompletionRate] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedBadge, setSelectedBadge] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const res = await fetchMyAchievementsApi();
                if (res && res.status === "success") {
                    setAchievements(res.data || []);
                    setUnlockedCount(res.unlocked_count);
                    setTotalCount(res.total_achievements);
                    setCompletionRate(res.completion_rate);
                }
            } catch (err) {
                console.warn("Lỗi tải danh sách thành tích:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const formatUnlockDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
        <section className="profile-card-section achievements-section">
            <div className="card-header-title space-between">
                <div className="left-title">
                    <div className="title-icon-wrapper star-icon-circle">
                        <Star size={18} color="#009080" strokeWidth={2.2} />
                    </div>
                    <div>
                        <h2>Thành tích check-in</h2>
                        <span className="achievements-progress-label">
                            Đã mở khóa {unlockedCount}/{totalCount} danh hiệu ({completionRate}%)
                        </span>
                    </div>
                </div>

                <div className="achievements-rate-pill">
                    <Trophy size={14} color="#D97706" />
                    <span>{completionRate}% hoàn thành</span>
                </div>
            </div>

            {/* Thanh tiến độ tổng thể */}
            <div className="achievements-overall-bar">
                <div
                    className="achievements-overall-fill"
                    style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }}
                />
            </div>

            {loading ? (
                <div className="achievements-loading-box">
                    <Loader2 size={24} className="ach-spin-icon" />
                    <span>Đang tải bảng danh hiệu...</span>
                </div>
            ) : achievements.length === 0 ? (
                <div className="achievements-loading-box">
                    <span>Chưa có danh hiệu nào được cấu hình.</span>
                </div>
            ) : (
                <div className="badges-flex-row">
                    {achievements.map((item) => {
                        const visual = BADGE_VISUALS[item.code] || {
                            mainColor: "#009080",
                            darkColor: "#006D60",
                            lightBorder: "#80DFD4",
                            ribbonText: item.achievement_type.toUpperCase(),
                            renderIcon: () => (
                                <g transform="translate(0, -2)">
                                    <circle cx="0" cy="0" r="10" fill="#FFFFFF" />
                                </g>
                            ),
                        };

                        return (
                            <div
                                key={item.id || item.code}
                                className={`badge-wrapper-item ${item.is_unlocked ? "unlocked" : "locked"}`}
                                onClick={() => setSelectedBadge(item)}
                                title={`${item.name} - Bấm để xem chi tiết`}
                            >
                                <HexBadge
                                    mainColor={visual.mainColor}
                                    darkColor={visual.darkColor}
                                    lightBorder={visual.lightBorder}
                                    ribbonText={visual.ribbonText}
                                    isLocked={!item.is_unlocked}
                                >
                                    {item.is_unlocked ? (
                                        visual.renderIcon()
                                    ) : (
                                        <g transform="translate(0, -4)">
                                            <rect x="-8" y="-4" width="16" height="14" rx="2" fill="#FFFFFF" />
                                            <path
                                                d="M-5 -4 V-8 C-5 -11 5 -11 5 -8 V-4"
                                                stroke="#FFFFFF"
                                                strokeWidth="2"
                                                fill="none"
                                            />
                                        </g>
                                    )}
                                </HexBadge>

                                <span className="badge-main-label">{item.name}</span>

                                {item.is_unlocked ? (
                                    <span className="badge-unlocked-tag">
                                        <CheckCircle2 size={11} />
                                        <span>Đã mở khóa</span>
                                    </span>
                                ) : (
                                    <div className="badge-progress-pill">
                                        <Lock size={10} />
                                        <span>
                                            {item.progress}/{item.target_value} ({item.progress_percent}%)
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal xem chi tiết danh hiệu */}
            {selectedBadge && (
                <div className="badge-modal-overlay" onClick={() => setSelectedBadge(null)}>
                    <div className="badge-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="badge-modal-header">
                            <div className="badge-modal-title-row">
                                <Trophy size={18} color={selectedBadge.is_unlocked ? "#059669" : "#64748B"} />
                                <h3>{selectedBadge.name}</h3>
                            </div>
                            <button
                                type="button"
                                className="badge-modal-close"
                                onClick={() => setSelectedBadge(null)}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="badge-modal-body">
                            <p className="badge-modal-desc">
                                {selectedBadge.description || "Thực hiện check-in và khám phá các địa danh để mở khóa danh hiệu này."}
                            </p>

                            <div className="badge-modal-stats-box">
                                <div className="modal-stat-item">
                                    <span className="modal-stat-label">Trạng thái</span>
                                    <span className={`modal-stat-value ${selectedBadge.is_unlocked ? "unlocked" : "locked"}`}>
                                        {selectedBadge.is_unlocked ? "✓ Đã mở khóa" : "🔒 Đang khóa"}
                                    </span>
                                </div>
                                <div className="modal-stat-item">
                                    <span className="modal-stat-label">Tiến độ hiện tại</span>
                                    <span className="modal-stat-value">
                                        {selectedBadge.progress} / {selectedBadge.target_value} ({selectedBadge.progress_percent}%)
                                    </span>
                                </div>
                                {selectedBadge.unlocked_at && (
                                    <div className="modal-stat-item">
                                        <span className="modal-stat-label">Ngày đạt được</span>
                                        <span className="modal-stat-value">
                                            {formatUnlockDate(selectedBadge.unlocked_at)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="badge-modal-progress-bar">
                                <div
                                    className="badge-modal-progress-fill"
                                    style={{
                                        width: `${Math.min(100, Math.max(0, selectedBadge.progress_percent))}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default Achievements;

