import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { SERVER_URL } from "../../services/api";

export default function SwaggerPage() {
    // استفاده از SERVER_URL از api.js به جای hardcode کردن URL
    // استفاده از مسیر مستقیم برای Swagger JSON
    const swaggerUrl = import.meta.env.DEV
        ? "/swagger/v1/swagger.json"
        : `${SERVER_URL}/swagger/v1/swagger.json`;

    return (
        <div className="swagger-container dark:bg-slate-900" style={{ height: 'calc(100vh - 100px)', overflow: 'auto' }}>
            <SwaggerUI url={swaggerUrl} />
        </div>
    );
}
