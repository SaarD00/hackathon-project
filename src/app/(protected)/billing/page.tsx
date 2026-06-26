import React from "react";

const BillingPage: React.FC = () => {
    return (
        <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
            <section style={{ maxWidth: "800px", margin: "0 auto" }}>
                <h1>Billing</h1>
                <p>Manage your subscription, billing details, and payment methods in one place.</p>

                <div style={{ marginTop: "1.5rem" }}>
                    <h2>Current Plan</h2>
                    <p>Basic Plan</p>
                </div>

                <div style={{ marginTop: "1.5rem" }}>
                    <h2>Payment Method</h2>
                    <p>Visa ending in 1234</p>
                </div>

                <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
                    <button style={{ padding: "0.75rem 1.25rem", border: "none", background: "#2563eb", color: "white", borderRadius: "0.5rem" }}>
                        Update Payment
                    </button>
                    <button style={{ padding: "0.75rem 1.25rem", border: "1px solid #d1d5db", background: "white", color: "#111827", borderRadius: "0.5rem" }}>
                        Change Plan
                    </button>
                </div>
            </section>
        </main>
    );
};

export default BillingPage;
