import React, { useState, useEffect, useCallback } from "react";
import { QrCode, Users, Search, Heart, AlertCircle, CheckCircle2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatCard from "../components/stats/StatCard";
import TimeFrequencyChart from "../components/stats/TimeFrequencyChart";
import TopLocationsChart from "../components/stats/TopLocationsChart";
import CategoryDonutChart from "../components/stats/CategoryDonutChart";
import {
    fetchStatisticsOverviewApi,
    fetchSearchTrendsApi,
    fetchTopPlacesApi,
    fetchCategoryDistributionApi,
    exportStatisticsReportApi,
} from "../service/statisticsService";
import "../css/Statistics.css";

function formatDateToIsoString(date) {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function Statistics() {
    // Mặc định khoảng ngày 30 ngày gần nhất
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 29);
        return d;
    });
    const [endDate, setEndDate] = useState(() => new Date());
    const [groupBy, setGroupBy] = useState("day");

    // Dữ liệu từ 4 API
    const [overview, setOverview] = useState(null);
    const [trends, setTrends] = useState([]);
    const [topLandmarks, setTopLandmarks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [totalCategorySearches, setTotalCategorySearches] = useState(0);

    // Trạng thái tải & thông báo
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const showToast = (message, type = "success") => {
        setToastMessage({ message, type });
        setTimeout(() => setToastMessage(null), 4000);
    };

    // Hàm gọi API đồng thời với khoảng ngày và group_by
    const loadAllStatistics = useCallback(async () => {
        const fromDateStr = formatDateToIsoString(startDate);
        const toDateStr = formatDateToIsoString(endDate);

        try {
            setLoading(true);
            setErrorMessage("");

            const [overviewRes, trendsRes, topRes, catRes] = await Promise.allSettled([
                fetchStatisticsOverviewApi({ from_date: fromDateStr, to_date: toDateStr }),
                fetchSearchTrendsApi({ from_date: fromDateStr, to_date: toDateStr, group_by: groupBy }),
                fetchTopPlacesApi({ from_date: fromDateStr, to_date: toDateStr, limit: 10 }),
                fetchCategoryDistributionApi({ from_date: fromDateStr, to_date: toDateStr }),
            ]);

            if (overviewRes.status === "fulfilled" && overviewRes.value?.data) {
                setOverview(overviewRes.value.data);
            }
            if (trendsRes.status === "fulfilled" && trendsRes.value?.data) {
                setTrends(trendsRes.value.data);
            }
            if (topRes.status === "fulfilled" && topRes.value?.data) {
                setTopLandmarks(topRes.value.data);
            }
            if (catRes.status === "fulfilled" && catRes.value?.data) {
                setCategories(catRes.value.data);
                setTotalCategorySearches(catRes.value.total_searches || 0);
            }
        } catch (err) {
            setErrorMessage("Không thể kết nối đến máy chủ thống kê. Vui lòng kiểm tra lại dịch vụ backend.");
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, groupBy]);

    useEffect(() => {
        loadAllStatistics();
    }, [loadAllStatistics]);

    // Xử lý khi người dùng chọn khoảng ngày từ DatePicker trên Header
    const handleDateRangeChange = (start, end) => {
        if (start && end) {
            setStartDate(start);
            setEndDate(end);
        }
    };

    // Xử lý khi người dùng đổi chế độ xem thời gian trên biểu đồ
    const handleGroupByChange = (newGroupBy) => {
        setGroupBy(newGroupBy);
    };

    // Xử lý khi người dùng nhấn Xuất báo cáo (Excel hoặc CSV)
    const handleExport = async (format) => {
        const fromDateStr = formatDateToIsoString(startDate);
        const toDateStr = formatDateToIsoString(endDate);

        try {
            setIsExporting(true);
            const { filename } = await exportStatisticsReportApi({
                from_date: fromDateStr,
                to_date: toDateStr,
                format: format || "xlsx",
            });
            showToast(`Đã xuất và tải file báo cáo thành công: ${filename}`, "success");
        } catch (error) {
            showToast(error.message || "Lỗi khi xuất file báo cáo.", "error");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="stats-page-container">
            <Sidebar activeMenu="statistics" />
            <div className="stats-main-content">
                <Header
                    title="Bảng Thống kê"
                    subtitle="Theo dõi tổng quan hoạt động khám phá của người dùng trên LandmarkAI"
                    showDateFilter={true}
                    showExportBtn={true}
                    startDate={startDate}
                    endDate={endDate}
                    onDateRangeChange={handleDateRangeChange}
                    onExport={handleExport}
                    isExporting={isExporting}
                />

                <main className="stats-body-padding">
                    {/* Toast Notification */}
                    {toastMessage && (
                        <div
                            className={`stats-toast-alert ${
                                toastMessage.type === "error" ? "toast-error" : "toast-success"
                            }`}
                        >
                            {toastMessage.type === "error" ? (
                                <AlertCircle size={18} />
                            ) : (
                                <CheckCircle2 size={18} />
                            )}
                            <span>{toastMessage.message}</span>
                        </div>
                    )}

                    {/* Error Banner */}
                    {errorMessage && (
                        <div className="stats-error-banner">
                            <AlertCircle size={20} color="#DC2626" />
                            <span>{errorMessage}</span>
                            <button type="button" onClick={loadAllStatistics}>Thử lại</button>
                        </div>
                    )}

                    {loading && !overview ? (
                        <div className="api-loading-overlay">
                            <div className="api-loading-spinner"></div>
                            <p>Đang tải dữ liệu thống kê từ hệ thống API...</p>
                        </div>
                    ) : (
                        <>
                            {/* 1. 4 Thẻ chỉ số KPI tổng quan */}
                            <div className="stat-cards-row">
                                <StatCard
                                    title="Tổng lượt quét ảnh AI"
                                    value={overview?.total_scans?.value ?? 0}
                                    growthPercentage={overview?.total_scans?.growth_percentage}
                                    isIncrease={overview?.total_scans?.is_increase}
                                    icon={QrCode}
                                    iconBgColor="#E0F2FE"
                                    iconColor="#009080"
                                />
                                <StatCard
                                    title="Người dùng hoạt động"
                                    value={overview?.active_users?.value ?? 0}
                                    growthPercentage={overview?.active_users?.growth_percentage}
                                    isIncrease={overview?.active_users?.is_increase}
                                    icon={Users}
                                    iconBgColor="#E6F4F1"
                                    iconColor="#10A090"
                                />
                                <StatCard
                                    title="Tổng số lượt tìm kiếm"
                                    value={overview?.total_searches?.value ?? 0}
                                    growthPercentage={overview?.total_searches?.growth_percentage}
                                    isIncrease={overview?.total_searches?.is_increase}
                                    icon={Search}
                                    iconBgColor="#FEF3C7"
                                    iconColor="#F59E0B"
                                />
                                <StatCard
                                    title="Địa điểm yêu thích mới"
                                    value={overview?.favorite_places?.value ?? 0}
                                    growthPercentage={overview?.favorite_places?.growth_percentage}
                                    isIncrease={overview?.favorite_places?.is_increase}
                                    icon={Heart}
                                    iconBgColor="#FFEDD5"
                                    iconColor="#F97316"
                                />
                            </div>

                            {/* 2. Biểu đồ tần suất tìm kiếm theo thời gian */}
                            <TimeFrequencyChart
                                apiTrendsData={trends}
                                groupBy={groupBy}
                                onGroupByChange={handleGroupByChange}
                                loading={loading}
                            />

                            {/* 3 & 4. Top 10 Địa điểm & Cơ cấu Danh mục Donut */}
                            <div className="charts-two-columns-row">
                                <TopLocationsChart
                                    apiLocationsData={topLandmarks}
                                    loading={loading}
                                />
                                <CategoryDonutChart
                                    apiCategoriesData={categories}
                                    totalSearches={totalCategorySearches}
                                    loading={loading}
                                />
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

export default Statistics;
