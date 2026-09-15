import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import PersonalForm from "../components/profile/PersonalForm";
import PasswordForm from "../components/profile/PasswordForm";
import SubscriptionCard from "../components/profile/SubscriptionCard";
import Achievements from "../components/profile/Achievements";
import "../css/Profile.css";

function Profile() {
    return (
        <div className="profile-page-container">
            <Sidebar activeMenu="profile" />
            <div className="profile-main-content">
                <Header
                    title="Hồ sơ Người dùng"
                    subtitle="Quản lý thông tin tài khoản và bảo mật"
                />
                <main className="profile-body-padding">
                    <SubscriptionCard />
                    <PersonalForm />
                    <PasswordForm />
                    <Achievements />
                </main>
            </div>
        </div>
    );
}

export default Profile;
