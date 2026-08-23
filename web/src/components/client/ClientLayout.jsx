import React from "react";
import ClientHeader from "./ClientHeader";
import ClientFooter from "./ClientFooter";
import "../../css/Client.css";

function ClientLayout({ children, activeTab }) {
    return (
        <div className="client-wrapper">
            <ClientHeader activeTab={activeTab} />
            <div className="client-main-content">
                {children}
            </div>
            <ClientFooter />
        </div>
    );
}

export default ClientLayout;
