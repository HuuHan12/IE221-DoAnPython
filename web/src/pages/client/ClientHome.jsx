import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Clock, ArrowUpRight, CheckCircle2, Sparkles, X } from "lucide-react";
import ClientLayout from "../../components/client/ClientLayout";
import "../../css/Client.css";

const initialArticles = [
    {
        id: 1,
        title: "36 phố phường Hà Nội: lộ trình đi bộ nửa ngày",
        category: "Miền Bắc",
        excerpt: "Từ Ô Quan Chưởng đến Nhà thờ Lớn, một vòng phố cổ đủ để hiểu nhịp sống thủ đô và bắt được ánh sáng đẹp nhất.",
        date: "05/08/2026",
        readTime: "6 phút",
        image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop",
        author: "Dư Hữu Hân",
        content: `Hà Nội 36 phố phường không chỉ là một khái niệm địa lý mà là cả một kho tàng lịch sử và văn hóa sống động. Để cảm nhận trọn vẹn nhịp đập thủ đô, một buổi sáng đi bộ từ phố cổ Ô Quan Chưởng, ghé qua chợ Đồng Xuân, thưởng thức một ly cà phê trứng bên đường Nguyễn Hữu Huân và kết thúc tại Nhà thờ Lớn là hành trình trải nghiệm tuyệt vời nhất.

Bài viết này cung cấp bản đồ đi bộ tối ưu, lịch trình chụp ảnh từng mốc thời gian vàng để bắt được những luồng nắng sớm len lỏi qua từng nếp nhà cổ kính.`
    },
    {
        id: 2,
        title: "Vịnh Hạ Long qua ống kính: chụp lúc nào cho đẹp?",
        category: "Miền Bắc",
        excerpt: "Giờ vàng, hướng nắng và những điểm neo thuyền cho khung hình núi đá vôi trong trẻo nhất giữa mùa hè.",
        date: "28/07/2026",
        readTime: "7 phút",
        image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=600&auto=format&fit=crop",
        author: "Nguyễn Văn A",
        content: `Vịnh Hạ Long với hàng ngàn đảo đá vôi kỳ vĩ là niềm cảm hứng vô tận cho các nhiếp ảnh gia. Tuy nhiên, thời tiết và sương mờ trên biển ảnh hưởng rất lớn đến chất lượng ảnh chụp.

Khung giờ vàng từ 5:30 đến 7:00 sáng là lúc mặt trời mới ló rạng qua các rặng núi đá, phản chiếu ánh sáng hoàng kim xuống mặt nước biển phẳng lặng. Hãy chuẩn bị ống kính góc rộng và các bộ lọc CPL để bắt trọn sắc xanh trong trẻo của mây trời Hạ Long.`
    },
    {
        id: 3,
        title: "Ruộng bậc thang Sa Pa và mùa nước đổ",
        category: "Miền Bắc",
        excerpt: "Lịch mùa vụ của người Mông, cung đường Tả Van - Lao Chải và cách chuẩn bị cho một ngày trekking ẩm ướt.",
        date: "23/07/2026",
        readTime: "9 phút",
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop",
        author: "Dư Hữu Hân",
        content: `Tháng 5 và tháng 6 hằng năm là thời điểm mùa nước đổ tại các vùng cao Tây Bắc. Ruộng bậc thang Sa Pa lấp lánh như những tấm gương khổng lồ soi bóng mây trời.

Hành trình từ bản Cát Cát đến Tả Van mang lại góc nhìn hoang sơ nhất. Khi sử dụng công cụ AI GeoCLIP của LandmarkAI, các bức ảnh chụp ruộng bậc thang có thể được nhận diện chính xác tọa độ vị trí nhờ các đặc trưng địa hình đồi núi độc bản.`
    },
    {
        id: 4,
        title: "Hội An về đêm: đèn lồng, sông Hoài và ký ức thương cảng",
        category: "Miền Trung",
        excerpt: "Vì sao phố cổ tắt đèn điện vào ngày rằm, và những góc ít người biết để ngắm đèn hoa đăng trôi.",
        date: "14/07/2026",
        readTime: "5 phút",
        image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&auto=format&fit=crop",
        author: "Trần Thị B",
        content: `Khi màn đêm buông xuống, Hội An khoác lên mình vẻ đẹp lung linh của hàng ngàn chiếc đèn lồng thủ công rực rỡ sắc màu.

Vào các đêm đêm rằm hàng tháng, phố cổ ngừng sử dụng ánh sáng điện cao áp, nhường không gian cho ánh đèn hoa đăng bập bềnh trên dòng sông Hoài thơ mộng.`
    },
    {
        id: 5,
        title: "Chùa Thiên Mụ: 400 năm bên dòng Hương",
        category: "Văn hoá",
        excerpt: "Tháp Phước Duyên bảy tầng, truyền thuyết bà lão áo đỏ và vị trí của ngôi chùa trong quy hoạch kinh thành Huế.",
        date: "02/07/2026",
        readTime: "10 phút",
        image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&auto=format&fit=crop",
        author: "Dư Hữu Hân",
        content: `Nằm trên ngọn đồi Hà Khê bên bờ sông Hương, Chùa Thiên Mụ là biểu tượng tâm linh và kiến trúc cổ kính của cố đô Huế. Tháp Phước Duyên cao 21m với 7 tầng tháp là mốc định danh trực quan rất đặc trưng trong bài toán nhận diện địa danh Việt Nam bằng Vision Transformers.`
    },
    {
        id: 6,
        title: "Vision Transformers giải thích cho người không học AI",
        category: "Cẩm nang AI",
        excerpt: "Máy tính chia ảnh thành các ô nhỏ rồi 'đọc' chúng như một câu văn – và đó là lý do nó nhận ra được địa danh.",
        date: "25/06/2026",
        readTime: "12 phút",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop",
        author: "Dư Hữu Hân",
        content: `Mô hình Vision Transformer (ViT) thay vì quét điểm ảnh theo cách truyền thống đã chia bức ảnh thành các 'patch' (mảnh nhỏ) rồi mã hóa không gian. Kết hợp với GeoCLIP, hệ thống hiểu được mối liên hệ giữa các điểm đặc trưng hình ảnh và tọa độ địa lý thực tế.`
    }
];

function ClientHome({ activeTab = "home" }) {
    const [selectedCategory, setSelectedCategory] = useState("Tất cả");
    const [searchQuery, setSearchQuery] = useState("");
    const [newsletterEmail, setNewsletterEmail] = useState("");
    const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
    const [activeArticle, setActiveArticle] = useState(null);

    const categories = ["Tất cả", "Cẩm nang AI", "Miền Bắc", "Miền Trung", "Miền Nam", "Văn hoá"];

    const filteredArticles = initialArticles.filter((article) => {
        const matchesCategory =
            selectedCategory === "Tất cả" || article.category === selectedCategory;
        const matchesSearch =
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        if (newsletterEmail.trim()) {
            setNewsletterSubscribed(true);
            setTimeout(() => setNewsletterSubscribed(false), 4000);
            setNewsletterEmail("");
        }
    };

    return (
        <ClientLayout activeTab={activeTab}>
            {/* HERO / HEADER TITLE SECTION */}
            <section className="client-hero-section">
                <div className="client-hero-header-row">
                    <div className="client-hero-left">
                        <span className="client-hero-subtitle">BLOG & CẨM NANG DU LỊCH</span>
                        <h1 className="client-hero-title">
                            Mỗi địa danh là một <span className="highlight-text">câu chuyện</span> chờ được kể
                        </h1>
                    </div>

                    {/* SEARCH BOX */}
                    <div className="client-search-box">
                        <Search size={18} className="client-search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm bài viết, địa danh..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="client-search-input"
                        />
                    </div>
                </div>

                {/* CATEGORY FILTER PILLS */}
                <div className="client-category-filters">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* FEATURED ARTICLE CARD */}
            <section>
                <div className="featured-article-card">
                    <div className="featured-image-wrapper">
                        <img
                            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1000&auto=format&fit=crop"
                            alt="Cách dùng AI để tìm ra nơi một bức ảnh được chụp"
                        />
                    </div>
                    <div className="featured-content">
                        <div>
                            <div className="featured-badge-row">
                                <span className="badge-tag">Cẩm nang AI</span>
                                <span className="read-time">
                                    <Clock size={14} /> 8 phút đọc
                                </span>
                            </div>

                            <h2 className="featured-title">
                                Cách dùng AI để tìm ra nơi một bức ảnh được chụp
                            </h2>

                            <p className="featured-description">
                                Hướng dẫn từng bước: chuẩn bị ảnh, thu hẹp vùng tìm kiếm, đọc điểm tin cậy và xác định toạ độ GPS trên bản đồ trước khi lên đường.
                            </p>
                        </div>

                        <div className="featured-footer">
                            <div className="author-info">
                                <div className="author-avatar">D</div>
                                <div>
                                    <span className="author-name">Dư Hữu Hân</span>
                                    <span className="publish-date">12/08/2026</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="btn-read-article"
                                onClick={() =>
                                    setActiveArticle({
                                        title: "Cách dùng AI để tìm ra nơi một bức ảnh được chụp",
                                        category: "Cẩm nang AI",
                                        author: "Dư Hữu Hân",
                                        date: "12/08/2026",
                                        readTime: "8 phút",
                                        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1000&auto=format&fit=crop",
                                        content: `Nhận diện vị trí địa danh tự động qua hình ảnh là bài toán tiên tiến của thị giác máy tính. Với mô hình GeoCLIP và Vision Transformers, bạn chỉ cần tải một bức ảnh phong cảnh bất kỳ, hệ thống sẽ phân tích các nét đặc trưng kiến trúc, địa hình núi sông để đưa ra tọa độ địa lý cùng mức độ tin cậy phần trăm.`
                                    })
                                }
                            >
                                <span>Đọc bài viết</span>
                                <ArrowUpRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ARTICLES GRID SECTION */}
            <section>
                <div className="section-header-row">
                    <h3 className="section-title">Bài viết mới nhất</h3>
                    <Link to="/dia-danh" className="section-link">
                        Xem địa danh
                    </Link>
                </div>

                <div className="articles-grid">
                    {filteredArticles.map((article) => (
                        <div
                            key={article.id}
                            className="article-card"
                            onClick={() => setActiveArticle(article)}
                        >
                            <div className="article-image-box">
                                <img src={article.image} alt={article.title} />
                                <span className="article-category-badge">{article.category}</span>
                            </div>
                            <div className="article-body">
                                <h4 className="article-title">{article.title}</h4>
                                <p className="article-excerpt">{article.excerpt}</p>
                                <div className="article-meta-footer">
                                    <span>{article.date}</span>
                                    <span className="read-time">
                                        <Clock size={12} /> {article.readTime}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* NEWSLETTER SIGNUP BANNER */}
            <section className="newsletter-banner">
                <div className="newsletter-text">
                    <h3>Nhận cẩm nang mới mỗi tuần</h3>
                    <p>
                        Một email ngắn: một địa danh mới trong hệ thống, một mẹo chụp ảnh và một thử thách check-in.
                    </p>
                </div>

                <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                    <input
                        type="email"
                        placeholder="Email của bạn"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        className="newsletter-input"
                        required
                    />
                    <button type="submit" className="btn-newsletter-submit">
                        {newsletterSubscribed ? "Đã đăng ký ✓" : "Đăng ký"}
                    </button>
                </form>
            </section>

            {/* SAMPLE LINK BELOW */}
            <div className="sample-link-wrapper">
                <Link to="/dia-danh" className="sample-link">
                    Xem mẫu trang chi tiết địa danh →
                </Link>
            </div>

            {/* ARTICLE MODAL POPUP */}
            {activeArticle && (
                <div className="article-modal-backdrop" onClick={() => setActiveArticle(null)}>
                    <div
                        className="article-modal-card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="article-modal-close"
                            onClick={() => setActiveArticle(null)}
                        >
                            ✕
                        </button>
                        <div className="featured-badge-row">
                            <span className="badge-tag">{activeArticle.category}</span>
                            <span className="read-time">
                                <Clock size={14} /> {activeArticle.readTime}
                            </span>
                        </div>
                        <h2 className="featured-title" style={{ marginTop: "12px" }}>
                            {activeArticle.title}
                        </h2>
                        <div className="author-info" style={{ marginBottom: "20px" }}>
                            <div className="author-avatar">
                                {activeArticle.author?.[0] || "A"}
                            </div>
                            <div>
                                <span className="author-name">{activeArticle.author}</span>
                                <span className="publish-date">{activeArticle.date}</span>
                            </div>
                        </div>
                        <img
                            src={activeArticle.image}
                            alt={activeArticle.title}
                            style={{
                                width: "100%",
                                maxHeight: "360px",
                                objectFit: "cover",
                                borderRadius: "16px",
                                marginBottom: "24px"
                            }}
                        />
                        <div style={{ fontSize: "1rem", lineHeight: "1.7", color: "#334155", whitespace: "pre-line" }}>
                            {activeArticle.content}
                        </div>
                    </div>
                </div>
            )}
        </ClientLayout>
    );
}

export default ClientHome;
