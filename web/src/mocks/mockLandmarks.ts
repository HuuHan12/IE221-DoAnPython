export interface LandmarkPreset {
    id: string;
    name: string;
    province: string;
    category: string;
    image: string;
    lat: number;
    lon: number;
    description: string;
}

export const SAMPLE_PRESETS: LandmarkPreset[] = [
    {
        id: "halong",
        name: "Vịnh Hạ Long",
        province: "Quảng Ninh",
        category: "Di sản thiên nhiên thế giới",
        image: "/images/landmarks/ha-long.jpg",
        lat: 20.91005,
        lon: 107.18390,
        description: "Vịnh Hạ Long là di sản thiên nhiên thế giới được UNESCO công nhận với hàng nghìn đảo đá vôi kỳ vĩ.",
    },
    {
        id: "benthanh",
        name: "Chợ Bến Thành",
        province: "TP. Hồ Chí Minh",
        category: "Chợ truyền thống",
        image: "/images/landmarks/cho-ben-thanh.jpg",
        lat: 10.772545,
        lon: 106.698042,
        description: "Biểu tượng lịch sử và mua sắm trung tâm quận 1, TP. Hồ Chí Minh.",
    },
    {
        id: "hoguom",
        name: "Hồ Gươm - Tháp Rùa",
        province: "Hà Nội",
        category: "Danh lam thắng cảnh",
        image: "/images/landmarks/ho-guom.jpg",
        lat: 21.028667,
        lon: 105.852148,
        description: "Trái tim lịch sử và văn hóa của thủ đô Hà Nội ngàn năm văn hiến.",
    },
    {
        id: "cauvang",
        name: "Cầu Vàng Bà Nà Hills",
        province: "Đà Nẵng",
        category: "Điểm du lịch",
        image: "/images/landmarks/ba-na-hills.jpg",
        lat: 15.995383,
        lon: 107.996452,
        description: "Cây cầu bàn tay khổng lồ trên đỉnh núi Bà Nà thu hút hàng triệu du khách quốc tế.",
    },
];
