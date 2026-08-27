import React, { useState, useEffect } from "react";
import { QrCode, Users, Search, Heart } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatCard from "../components/stats/StatCard";
import TimeFrequencyChart from "../components/stats/TimeFrequencyChart";
import TopLocationsChart from "../components/stats/TopLocationsChart";
import CategoryDonutChart from "../components/stats/CategoryDonutChart";
import { fetchStatisticsOverviewApi, fetchTopLandmarksApi, fetchStatisticsTrendsApi } from "../service/statisticsService";
import "../css/Statistics.css";

function Statistics() {
    const [overview, setOverview] = useState(null);
    const [topLandmarks, setTopLandmarks] = useState([]);
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStatsData = async () => {
            try {
                setLoading(true);
                const [overviewRes, topRes, trendsRes] = await Promise.all([
                    fetchStatisticsOverviewApi().catch(() => null),
                    fetchTopLandmarksApi(10).catch(() => null),
                    fetchStatisticsTrendsApi(7).catch(() => null),
                ]);

                if (overviewRes) {
                    setOverview(overviewRes);
                }
                if (topRes?.items) {
                    setTopLandmarks(topRes.items);
                }
                if (trendsRes?.items) {
                    setTrends(trendsRes.items);
                }
            } catch (err) {
                // Ignore API error
            } finally {
                setLoading(false);
            }
        };

        loadStatsData();
    }, []);

    const totalScans = overview?.total_scans != null ? overview.total_scans.toLocaleString("vi-VN") : "0";
    const totalLandmarks = overview?.total_landmarks != null ? overview.total_landmarks.toLocaleString("vi-VN") : "0";
    const avgAccuracy = overview?.avg_accuracy != null ? `${overview.avg_accuracy}%` : "0%";
    const totalGallery = overview?.total_gallery != null ? overview.total_gallery.toLocaleString("vi-VN") : "0";

    return (
        <div className="stats-page-container">
            <Sidebar activeMenu="statistics" />
            <div className="stats-main-content">
                <Header
                    title="Bảng Thống kê"
                    subtitle="Theo dõi tổng quan hoạt động khám phá của người dùng trên LandmarkAI"
                    showDateFilter={true}
                    showExportBtn={true}
                    notificationCount={3}
                />
                <main className="stats-body-padding">
                    {loading ? (
                        <div className="api-loading-overlay">
                            <div className="api-loading-spinner"></div>
                            <p>Đang tải dữ liệu thống kê động từ máy chủ API...</p>
                        </div>
                    ) : (
                        <>
                            {/* Stat Cards 4-grid (Dynamic data from API) */}
                            <div className="stat-cards-row">
                                <StatCard
                                    title="Tổng lượt quét AI"
                                    value={totalScans}
                                    percentage={overview?.total_scans ? "Đã cập nhật" : "Tải từ API"}
                                    icon={QrCode}
                                    iconBgColor="#E0F2FE"
                                    iconColor="#009080"
                                />
                                <StatCard
                                    title="Địa danh đã quét"
                                    value={totalLandmarks}
                                    percentage={overview?.total_landmarks ? "Đã cập nhật" : "Tải từ API"}
                                    icon={Users}
                                    iconBgColor="#E6F4F1"
                                    iconColor="#10A090"
                                />
                                <StatCard
                                    title="Độ chính xác trung bình"
                                    value={avgAccuracy}
                                    percentage={overview?.accuracy_level || "Chính xác cao"}
                                    icon={Search}
                                    iconBgColor="#FEF3C7"
                                    iconColor="#F59E0B"
                                />
                                <StatCard
                                    title="Ảnh trong kho cá nhân"
                                    value={totalGallery}
                                    percentage={overview?.total_gallery ? "Đã lưu trữ" : "Tải từ API"}
                                    icon={Heart}
                                    iconBgColor="#FFEDD5"
                                    iconColor="#F97316"
                                />
                            </div>

                            {/* Middle: Search Frequency Over Time (Line Chart) */}
                            <TimeFrequencyChart apiTrendsData={trends} />

                            {/* Bottom: Top 10 Locations & Category Breakdown Donut */}
                            <div className="charts-two-columns-row">
                                <TopLocationsChart apiLocationsData={topLandmarks} />
                                <CategoryDonutChart />
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

export default Statistics;
