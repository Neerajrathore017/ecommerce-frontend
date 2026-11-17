
"use client";

import cartService from "@/app/(services)/cart";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Radio,
    RadioGroup,
    FormControlLabel,
    Divider,
    Chip,
    Stack,
    CircularProgress,
    Alert
} from "@mui/material";

import {
    ShoppingCart,
    LocationOn,
    CreditCard,
    Add,
    ArrowBack,
    CheckCircle,
    ShoppingBag
} from "@mui/icons-material";
import orderService from "@/app/(services)/order";
import paymentService from "@/app/(services)/payment";

export default function Checkout() {

    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [address, setAddress] = useState("home");
    const [payment, setPayment] = useState("card");

    const navigate = useRouter();
    const paymentMethodMap = {
        upi: "UPI",
        card: "CREDIT_CARD",
        debit_card: "DEBIT_CARD",
        net_banking: "NET_BANKING",
        wallet: "WALLET",
        cod: "COD"
    };
    // Fetch cart from Cart Service
    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await cartService.getCart();

            console.log("Cart API Response:", response);

            // Supports both Axios response and direct JSON response
            const cartData = response?.data ?? response;

            // Your API response contains items inside cart object
            setCart(
                Array.isArray(cartData?.items)
                    ? cartData.items
                    : []
            );

        } catch (err) {
            console.error("Cart Error:", err);
            setError(err.message || "Unable to load cart");
        } finally {
            setLoading(false);
        }
    };

    // Check out-of-stock products
    const hasOutOfStockItems = cart.some(
        item =>
            item.status === "OUT_OF_STOCK" ||
            Number(item.availableQuantity) < Number(item.quantity)
    );

    // Check empty cart
    const isCartEmpty = cart.length === 0;

    // Calculate subtotal
    const subtotal = cart.reduce(
        (total, item) =>
            total +
            Number(item.price || 0) *
            Number(item.quantity || 0),
        0
    );

    const shipping = 0;

    const tax = Math.round(subtotal * 0.18);

    const total = subtotal + shipping + tax;

    const placeOrder = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await orderService.createOrder();

            console.log("Order API Response:", response);

            const orderData = response?.data ?? response;

            // Save order details
            setCart(
                Array.isArray(orderData?.items)
                    ? orderData.items
                    : []
            );

            return orderData; // Return successful order response

        } catch (err) {
            console.error("Order Error:", err);

            setError(err.message || "Unable to place order");

            return null; // Order creation failed

        } finally {
            setLoading(false);
        }
    };


    // Place Order button

    const handlePlaceOrder = async () => {

        if (isCartEmpty) {
            setError("Your cart is empty");
            return;
        }

        try {
            setLoading(true);
            setError("");
            const selectedPaymentMethod = paymentMethodMap[payment];
            console.log("Test before  callng order api : ".selectedPaymentMethod)

            // Step 1: Create order with selected payment method
            const response = await orderService.createOrder(selectedPaymentMethod);

            const orderData = response?.data ?? response;

            console.log("Order Data:", orderData);

            if (!orderData?.id) {
                throw new Error("Order creation failed");
            }

            // Step 2: Prepare payment request
            const paymentRequest = {
                orderId: orderData.id,
                amount: orderData.totalAmount,
                paymentMethod: payment.toUpperCase()
            };

            console.log("Payment Request:", paymentRequest);

            // Step 3: Initiate payment
            const paymentResponse =
                await paymentService.initiatePayment(paymentRequest);

            console.log("Payment API Response:", paymentResponse.data);

            // Step 4: Navigate after successful API response
            navigate.push(
                `/payment-success?paymentId=${paymentResponse.data.id}`
            );

        } catch (err) {
            console.error("Checkout Error:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to complete checkout"
            );

        } finally {
            setLoading(false);
        }
    };


    // Loading UI
    if (loading) {
        return (
            <Container
                sx={{
                    py: 10,
                    display: "flex",
                    justifyContent: "center"
                }}
            >
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>

            {/* Checkout Heading */}
            <Box mb={4}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <ShoppingBag color="primary" fontSize="large" />

                    <Typography variant="h4" fontWeight={700}>
                        Checkout
                    </Typography>
                </Stack>

                <Typography color="text.secondary" mt={1}>
                    Review your details and place your order
                </Typography>
            </Box>

            {/* Error */}
            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    onClose={() => setError("")}
                >
                    {error}
                </Alert>
            )}

            {/* Empty Cart */}
            {isCartEmpty && (
                <Card sx={{ p: 4, textAlign: "center" }}>
                    <ShoppingCart
                        sx={{ fontSize: 60, color: "text.secondary" }}
                    />

                    <Typography variant="h6" mt={2}>
                        Your cart is empty
                    </Typography>

                    <Button
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={() => navigate.push("/products")}
                    >
                        Continue Shopping
                    </Button>
                </Card>
            )}

            {!isCartEmpty && (
                <Grid container spacing={3}>

                    {/* LEFT SECTION */}
                    <Grid size={{ xs: 12, md: 8 }}>

                        {/* Delivery Address */}
                        <Card sx={{ mb: 3, borderRadius: 3 }}>
                            <CardContent>

                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    mb={2}
                                >
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                    >
                                        <LocationOn color="primary" />

                                        <Typography
                                            variant="h6"
                                            fontWeight={600}
                                        >
                                            Delivery Address
                                        </Typography>
                                    </Stack>

                                    <Button
                                        startIcon={<Add />}
                                        size="small"
                                    >
                                        Add New Address
                                    </Button>
                                </Stack>

                                <RadioGroup
                                    value={address}
                                    onChange={(e) =>
                                        setAddress(e.target.value)
                                    }
                                >
                                    <Card
                                        variant="outlined"
                                        sx={{
                                            borderColor:
                                                address === "home"
                                                    ? "primary.main"
                                                    : "divider",

                                            bgcolor:
                                                address === "home"
                                                    ? "primary.50"
                                                    : "white"
                                        }}
                                    >
                                        <FormControlLabel
                                            value="home"
                                            control={<Radio />}
                                            sx={{
                                                p: 2,
                                                alignItems: "flex-start",
                                                width: "100%",
                                                m: 0
                                            }}
                                            label={
                                                <Box>
                                                    <Typography fontWeight={600}>
                                                        Neeraj Rathore
                                                    </Typography>

                                                    <Typography>
                                                        Flat No. 101,
                                                        Apple Residency
                                                    </Typography>

                                                    <Typography>
                                                        Pune, Maharashtra
                                                        - 411001
                                                    </Typography>

                                                    <Typography>
                                                        Phone: +91 98765 43210
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </Card>
                                </RadioGroup>

                            </CardContent>
                        </Card>

                        {/* Payment Method */}
                        <Card sx={{ borderRadius: 3 }}>
                            <CardContent>

                                <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                    mb={2}
                                >
                                    <CreditCard color="primary" />

                                    <Typography
                                        variant="h6"
                                        fontWeight={600}
                                    >
                                        Payment Method
                                    </Typography>
                                </Stack>

                                <RadioGroup
                                    value={payment}
                                    onChange={(e) =>
                                        setPayment(e.target.value)
                                    }
                                >
                                    <Grid container spacing={2}>

                                        {[
                                            {
                                                value: "card",
                                                label: "Credit / Debit Card"
                                            },
                                            {
                                                value: "upi",
                                                label: "UPI"
                                            },
                                            {
                                                value: "wallet",
                                                label: "Wallet"
                                            }
                                        ].map((method) => (

                                            <Grid
                                                size={{ xs: 12, sm: 4 }}
                                                key={method.value}
                                            >
                                                <Card
                                                    variant="outlined"
                                                    sx={{
                                                        height: "100%",
                                                        borderColor:
                                                            payment === method.value
                                                                ? "primary.main"
                                                                : "divider",

                                                        bgcolor:
                                                            payment === method.value
                                                                ? "primary.50"
                                                                : "white"
                                                    }}
                                                >
                                                    <FormControlLabel
                                                        value={method.value}
                                                        control={<Radio />}
                                                        sx={{
                                                            p: 1.5,
                                                            width: "100%",
                                                            m: 0
                                                        }}
                                                        label={
                                                            <Typography fontWeight={500}>
                                                                {method.label}
                                                            </Typography>
                                                        }
                                                    />
                                                </Card>
                                            </Grid>

                                        ))}

                                    </Grid>
                                </RadioGroup>

                            </CardContent>
                        </Card>

                        {/* Back to Cart */}
                        <Button
                            startIcon={<ArrowBack />}
                            sx={{ mt: 3 }}
                            onClick={() => navigate.push("/cart")}
                        >
                            Back to Cart
                        </Button>

                    </Grid>

                    {/* RIGHT SECTION: ORDER SUMMARY */}
                    <Grid size={{ xs: 12, md: 4 }}>

                        <Card
                            sx={{
                                borderRadius: 3,
                                position: "sticky",
                                top: 20
                            }}
                        >

                            {/* Header */}
                            <Box
                                sx={{
                                    bgcolor: "primary.main",
                                    color: "white",
                                    p: 2,
                                    borderRadius: "12px 12px 0 0"
                                }}
                            >
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                >
                                    <ShoppingCart />

                                    <Typography
                                        variant="h6"
                                        fontWeight={600}
                                    >
                                        Order Summary
                                    </Typography>
                                </Stack>
                            </Box>

                            <CardContent>

                                {/* Cart Products */}
                                {cart.map((item) => (

                                    <Stack
                                        key={item.id}
                                        direction="row"
                                        spacing={2}
                                        mb={2}
                                        alignItems="center"
                                    >

                                        <Box
                                            component="img"
                                            src={item.imageUrl}
                                            alt={item.name}
                                            sx={{
                                                width: 70,
                                                height: 70,
                                                objectFit: "contain",
                                                borderRadius: 2,
                                                bgcolor: "grey.100"
                                            }}
                                        />

                                        <Box flex={1}>
                                            <Typography fontWeight={600}>
                                                {item.name}
                                            </Typography>

                                            <Typography
                                                color="text.secondary"
                                                variant="body2"
                                            >
                                                Qty: {item.quantity}
                                            </Typography>

                                            {item.status === "OUT_OF_STOCK" && (
                                                <Chip
                                                    label="Out of Stock"
                                                    color="error"
                                                    size="small"
                                                    sx={{ mt: 0.5 }}
                                                />
                                            )}
                                        </Box>

                                        <Typography fontWeight={600}>
                                            ₹{(
                                                Number(item.price) *
                                                Number(item.quantity)
                                            ).toLocaleString("en-IN")}
                                        </Typography>

                                    </Stack>

                                ))}

                                <Divider sx={{ my: 2 }} />

                                {/* Price Details */}
                                <Stack spacing={1.5}>

                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                    >
                                        <Typography>
                                            Subtotal
                                        </Typography>

                                        <Typography>
                                            ₹{subtotal.toLocaleString("en-IN")}
                                        </Typography>
                                    </Stack>

                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                    >
                                        <Typography>
                                            Shipping
                                        </Typography>

                                        <Chip
                                            label="Free"
                                            color="success"
                                            size="small"
                                        />
                                    </Stack>

                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                    >
                                        <Typography>
                                            Tax (18%)
                                        </Typography>

                                        <Typography>
                                            ₹{tax.toLocaleString("en-IN")}
                                        </Typography>
                                    </Stack>

                                </Stack>

                                <Divider sx={{ my: 2 }} />

                                {/* Total */}
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <Typography fontWeight={700}>
                                        Total Amount
                                    </Typography>

                                    <Typography
                                        variant="h6"
                                        color="primary"
                                        fontWeight={700}
                                    >
                                        ₹{total.toLocaleString("en-IN")}
                                    </Typography>
                                </Stack>

                                {/* Place Order */}
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    startIcon={<CheckCircle />}
                                    sx={{ mt: 3, py: 1.5 }}
                                    // disabled={
                                    //     isCartEmpty ||
                                    //     hasOutOfStockItems
                                    // }
                                    onClick={handlePlaceOrder}
                                >
                                    Place Order
                                </Button>

                                {hasOutOfStockItems && (
                                    <Alert
                                        severity="warning"
                                        sx={{ mt: 2 }}
                                    >
                                        Remove out-of-stock items
                                        before placing your order.
                                    </Alert>
                                )}

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                        textAlign: "center",
                                        display: "block",
                                        mt: 2
                                    }}
                                >
                                    Secure checkout
                                </Typography>

                            </CardContent>
                        </Card>

                    </Grid>

                </Grid>
            )}

        </Container>
    );
}
