import { QrCode, Users, Search, Heart } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatCard from "../components/stats/StatCard";
import TimeFrequencyChart from "../components/stats/TimeFrequencyChart";
import TopLocationsChart from "../components/stats/TopLocationsChart";
import CategoryDonutChart from "../components/stats/CategoryDonutChart";
import "../css/Statistics.css";

function Statistics() {
    return (
        <div className="stats-page-container">
            <Sidebar activeMenu="statistics" />
            <div className="stats-main-content">
                <Header
                    title="Bảng Thống kê"
                    subtitle="Theo dõi tổng quan hoạt động khám phá của người dùng trên Travel AI"
                    showDateFilter={true}
                    showExportBtn={true}
                    notificationCount={3}
                />
                <main className="stats-body-padding">
                    {/* Stat Cards 4-grid */}
                    <div className="stat-cards-row">
                        <StatCard
                            title="Tổng lượt quét"
                            value="28.549"
                            percentage="18,6%"
                            icon={QrCode}
                            iconBgColor="#E0F2FE"
                            iconColor="#009080"
                        />
                        <StatCard
                            title="Người dùng hoạt động"
                            value="8.732"
                            percentage="14,3%"
                            icon={Users}
                            iconBgColor="#E6F4F1"
                            iconColor="#10A090"
                        />
                        <StatCard
                            title="Lượt tìm kiếm"
                            value="41.689"
                            percentage="21,7%"
                            icon={Search}
                            iconBgColor="#FEF3C7"
                            iconColor="#F59E0B"
                        />
                        <StatCard
                            title="Địa điểm yêu thích"
                            value="12.163"
                            percentage="16,4%"
                            icon={Heart}
                            iconBgColor="#FFEDD5"
                            iconColor="#F97316"
                        />
                    </div>

                    {/* Middle: Search Frequency Over Time (Line Chart) */}
                    <TimeFrequencyChart />

                    {/* Bottom: Top 10 Locations & Category Breakdown Donut */}
                    <div className="charts-two-columns-row">
                        <TopLocationsChart />
                        <CategoryDonutChart />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Statistics;
