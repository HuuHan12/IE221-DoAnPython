import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import PersonalForm from "../components/profile/PersonalForm";
import PasswordForm from "../components/profile/PasswordForm";
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
                    notificationCount={2}
                />
                <main className="profile-body-padding">
                    <PersonalForm />
                    <PasswordForm />
                    <Achievements />
                </main>
            </div>
        </div>
    );
}

export default Profile;
