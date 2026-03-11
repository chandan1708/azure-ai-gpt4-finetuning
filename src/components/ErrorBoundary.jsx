import { Component } from "react";

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error("[ErrorBoundary]", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div style={{
                        padding: "12px 16px",
                        borderRadius: 10,
                        background: "rgba(239,68,68,0.12)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        color: "#fca5a5",
                        fontSize: 13,
                    }}>
                        ⚠️ Something went wrong rendering this message.
                    </div>
                )
            );
        }
        return this.props.children;
    }
}
