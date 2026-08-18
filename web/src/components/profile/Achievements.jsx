import { Star, ChevronRight } from "lucide-react";

function HexBadge({
    mainColor,
    darkColor,
    lightBorder,
    children,
    ribbonText,
}) {
    return (
        <div className="badge-svg-container">
            <svg viewBox="0 0 100 115" width="90" height="104" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id={`grad-${mainColor.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={mainColor} />
                        <stop offset="100%" stopColor={darkColor} />
                    </linearGradient>
                    <filter id="badge-shadow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor={darkColor} floodOpacity="0.3" />
                    </filter>
                </defs>

                {/* Outer Rounded Hexagon Shadow & Main Fill */}
                <path
                    d="M50 4 C53 4 56 5.5 58 7.5 L88 24.5 C92 27 94 30.5 94 35 L94 75 C94 79.5 92 83 88 85.5 L58 102.5 C56 104.5 53 106 50 106 C47 106 44 104.5 42 102.5 L12 85.5 C8 83 6 79.5 6 75 L6 35 C6 30.5 8 27 12 24.5 L42 7.5 C44 5.5 47 4 50 4 Z"
                    fill={`url(#grad-${mainColor.replace('#', '')})`}
                    filter="url(#badge-shadow)"
                />

                {/* Outer Double Outline Ring */}
                <path
                    d="M50 8 C52.5 8 55 9.2 56.5 11 L85 27 C88.5 29 90 32 90 36 L90 74 C90 78 88.5 81 85 83 L56.5 99 C55 100.8 52.5 102 50 102 C47.5 102 45 100.8 43.5 99 L15 83 C11.5 81 10 78 10 74 L10 36 C10 32 11.5 29 15 27 L43.5 11 C45 9.2 47.5 8 50 8 Z"
                    stroke={lightBorder || "rgba(255,255,255,0.4)"}
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
                    {/* Left Laurel Leaves */}
                    <path d="M26 48 C24 45 22 50 25 52 C27 51 28 49 26 48 Z" />
                    <path d="M24 57 C21 55 20 60 23 61 C25 60 26 58 24 57 Z" />
                    <path d="M25 66 C22 65 22 70 25 71 C27 69 27 67 25 66 Z" />
                    {/* Right Laurel Leaves */}
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
                        {/* Left Ribbon Back Fold */}
                        <path d="M8 12 L16 4 L16 16 Z" fill={darkColor} filter="brightness(0.7)" />
                        {/* Right Ribbon Back Fold */}
                        <path d="M92 12 L84 4 L84 16 Z" fill={darkColor} filter="brightness(0.7)" />

                        {/* Ribbon Body */}
                        <path d="M12 4 H88 L94 10 L88 16 H12 L6 10 L12 4 Z" fill={darkColor} />
                        <path d="M14 6 H86 L90 10 L86 14 H14 L10 10 L14 6 Z" fill="rgba(255,255,255,0.15)" />

                        {/* Ribbon Text */}
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

function Achievements() {
    return (
        <section className="profile-card-section achievements-section">
            <div className="card-header-title space-between">
                <div className="left-title">
                    <div className="title-icon-wrapper star-icon-circle">
                        <Star size={18} color="#009080" strokeWidth={2.2} />
                    </div>
                    <h2>Thành tích check-in</h2>
                </div>
                <a href="#all-badges" className="link-view-all">
                    <span>Xem tất cả</span>
                    <ChevronRight size={16} />
                </a>
            </div>

            <div className="badges-flex-row">
                {/* Badge 1: Kiên trì 1 ngày */}
                <div className="badge-wrapper-item">
                    <HexBadge
                        mainColor="#4ADE80"
                        darkColor="#15803D"
                        lightBorder="#86EFAC"
                        ribbonText="1 NGÀY"
                    >
                        {/* Calendar icon with checkmark */}
                        <g transform="translate(-16, -18)">
                            <rect x="4" y="6" width="24" height="22" rx="4" fill="#FFFFFF" />
                            <path d="M4 11 H28" stroke="#15803D" strokeWidth="2" />
                            <circle cx="10" cy="4" r="1.5" fill="#FFFFFF" />
                            <circle cx="22" cy="4" r="1.5" fill="#FFFFFF" />
                            <circle cx="16" cy="18" r="6" fill="#22C55E" />
                            <path d="M13 18 L15 20 L19 16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                    </HexBadge>
                    <span className="badge-main-label">Kiên trì 1 ngày</span>
                </div>

                {/* Badge 2: Kiên trì 7 ngày */}
                <div className="badge-wrapper-item">
                    <HexBadge
                        mainColor="#3B82F6"
                        darkColor="#1D4ED8"
                        lightBorder="#93C5FD"
                        ribbonText="7 NGÀY"
                    >
                        {/* Calendar icon with number 7 */}
                        <g transform="translate(-16, -18)">
                            <rect x="4" y="6" width="24" height="22" rx="4" fill="#FFFFFF" />
                            <path d="M4 11 H28" stroke="#1D4ED8" strokeWidth="2" />
                            <circle cx="10" cy="4" r="1.5" fill="#FFFFFF" />
                            <circle cx="22" cy="4" r="1.5" fill="#FFFFFF" />
                            <text x="16" y="23" textAnchor="middle" fill="#1D4ED8" fontSize="11" fontWeight="800">7</text>
                        </g>
                    </HexBadge>
                    <span className="badge-main-label">Kiên trì 7 ngày</span>
                </div>

                {/* Badge 3: Kiên trì 30 ngày */}
                <div className="badge-wrapper-item">
                    <HexBadge
                        mainColor="#A78BFA"
                        darkColor="#6D28D9"
                        lightBorder="#C4B5FD"
                        ribbonText="7 NGÀY"
                    >
                        {/* Big 30 text */}
                        <g transform="translate(0, -2)">
                            <text textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="900" letterSpacing="-0.5">30</text>
                        </g>
                    </HexBadge>
                    <span className="badge-main-label">Kiên trì 30 ngày</span>
                </div>

                {/* Badge 4: Check-in 50 lần */}
                <div className="badge-wrapper-item">
                    <HexBadge
                        mainColor="#FB923C"
                        darkColor="#C2410C"
                        lightBorder="#FDBA74"
                        ribbonText="1 LẦN"
                    >
                        {/* Big 50 text */}
                        <g transform="translate(0, -2)">
                            <text textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="900" letterSpacing="-0.5">50</text>
                        </g>
                    </HexBadge>
                    <span className="badge-main-label">Check-in 50 lần</span>
                </div>

                {/* Badge 5: Check-in 100 lần */}
                <div className="badge-wrapper-item">
                    <HexBadge
                        mainColor="#F472B6"
                        darkColor="#BE123C"
                        lightBorder="#F9A8D4"
                        ribbonText="1 LẦN"
                    >
                        {/* Big 100 text */}
                        <g transform="translate(0, -2)">
                            <text textAnchor="middle" fill="#FFFFFF" fontSize="20" fontWeight="900" letterSpacing="-1">100</text>
                        </g>
                    </HexBadge>
                    <span className="badge-main-label">Check-in 100 lần</span>
                </div>

                {/* Badge 6: Explorer */}
                <div className="badge-wrapper-item">
                    <HexBadge
                        mainColor="#2DD4BF"
                        darkColor="#0F766E"
                        lightBorder="#99F6E4"
                    >
                        {/* Map pin icon */}
                        <g transform="translate(0, -6)">
                            <path
                                d="M0 -14 C-9 -14 -16 -7 -16 2 C-16 11 0 22 0 22 C0 22 16 11 16 2 C16 -7 9 -14 0 -14 Z"
                                fill="#FFFFFF"
                            />
                            <circle cx="0" cy="-2" r="5" fill="#0F766E" />
                            <path d="M-8 24 H8" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                        </g>
                    </HexBadge>
                    <span className="badge-main-label">Explorer</span>
                    <span className="badge-sub-label">10 địa điểm</span>
                </div>

                {/* Badge 7: Vua check-in */}
                <div className="badge-wrapper-item">
                    <HexBadge
                        mainColor="#FBBF24"
                        darkColor="#B45309"
                        lightBorder="#FDE047"
                    >
                        {/* Crown icon with sparkles */}
                        <g transform="translate(0, -2)">
                            {/* Sparkles */}
                            <circle cx="-10" cy="-14" r="1.5" fill="#FFFFFF" />
                            <circle cx="0" cy="-16" r="2" fill="#FFFFFF" />
                            <circle cx="10" cy="-14" r="1.5" fill="#FFFFFF" />
                            {/* Crown */}
                            <path
                                d="M-15 10 L-18 -6 L-9 0 L0 -10 L9 0 L18 -6 L15 10 Z"
                                fill="#FFFFFF"
                            />
                            <rect x="-13" y="11" width="26" height="3" rx="1.5" fill="#FFFFFF" />
                        </g>
                    </HexBadge>
                    <span className="badge-main-label">Vua check-in</span>
                    <span className="badge-sub-label">Top 1 tuần</span>
                </div>
            </div>
        </section>
    );
}

export default Achievements;
