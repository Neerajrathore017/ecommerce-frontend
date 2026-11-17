"use client";

import { useEffect, useState } from "react";

export default function Payment() {
    useEffect(() => {
        // fetchCart();
        console.log("Payment page loaded");
    }, []);


     return (
        <div>
            <h1>Payment Page</h1>
            <p>Implement your payment logic here.</p>
        </div>
    );
}