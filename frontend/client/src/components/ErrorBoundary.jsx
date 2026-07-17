// src/components/ErrorBoundary.jsx
// Catches render errors anywhere in the tree so customers see a friendly
// message instead of a permanent white screen.
import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#f5e8c7",
            color: "#3f2a1d",
            fontFamily: "Georgia, serif",
            textAlign: "center",
            padding: "1.5rem",
          }}
        >
          <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>☕</p>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
            Something went wrong on our end.
          </h1>
          <p>
            Please refresh the page — or call us at{" "}
            <a href="tel:4166993874" style={{ color: "#c2410c" }}>
              416-699-3874
            </a>{" "}
            and we'll take care of you.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
