"use client"
import cartService from "@/app/(services)/cart";

import { useEffect, useState } from "react";
import { Box,Container, Typography, Grid, Card, CardContent, CardMedia,Button, IconButton, Divider, Paper, CircularProgress, Alert,
} from "@mui/material";

import {
  Add,
  Remove,
  DeleteOutlined,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";


export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useRouter();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartService.getCart();
        console.log(" All product in cart ".res)
      setCart(response);
    } catch (err) {
      setError(err.message || "Unable to load cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (itemId, change) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: Math.max(
                1,
                Math.min(
                  item.availableQuantity,
                  item.quantity + change
                )
              ),
            }
          : item
      ),
    }));
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/items/${itemId}`);
      setCart((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== itemId),
      }));
    } catch (err) {
      setError(err.message || "Unable to remove item");
    }
  };

  const total = cart?.items?.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  ) || 0;

  if (loading) {
    return (
      <Box display="flex" justifycontent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !cart) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!cart?.items?.length) {
    return (
      <Container sx={{ textAlign: "center", py: 10 }}>
        <ShoppingCartOutlined sx={{ fontSize: 80 }} />
        <Typography variant="h5" mt={2}>
          Your cart is empty
        </Typography>
        <Typography color="text.secondary" mt={1}>
          Add products to your cart to get started.
        </Typography>
        <Button variant="contained" sx={{ mt: 3 }}>
          Continue Shopping
        </Button>
      </Container>
    );
  }

  const handleCheckout = () => {
  navigate.push("/checkout")
};

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        Shopping Cart
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          {cart.items.map((item) => (
            <Card key={item.id} sx={{ mb: 2, p: 2 }}>
              <Box display="flex" gap={2} alignItems="center">
                <CardMedia
                  component="img"
                  image={item.imageUrl}
                  alt={item.name}
                  sx={{
                    width: 120,
                    height: 120,
                    objectFit: "contain",
                  }}
                />

                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {item.name}
                  </Typography>

                  <Typography color="text.secondary">
                    {item.category}
                  </Typography>

                  <Typography color="success.main" variant="body2">
                    {item.availableQuantity} available
                  </Typography>

                  <Typography fontWeight="bold" mt={1}>
                    ₹{item.price.toLocaleString("en-IN")}
                  </Typography>

                  <Box style={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <IconButton
                      onClick={() => updateQuantity(item.id, -1)}
                      disabled={item.quantity <= 1}
                    >
                      <Remove />
                    </IconButton>

                    <Typography>{item.quantity}</Typography>

                    <IconButton
                      onClick={() => updateQuantity(item.id, 1)}
                      disabled={
                        item.quantity >= item.availableQuantity
                      }
                    >
                      <Add />
                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={() => removeItem(item.id)}
                    >
                      <DeleteOutlined />
                    </IconButton>
                  </Box>
                </CardContent>
              </Box>
            </Card>
          ))}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Order Summary
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box display="flex" justifycontent="space-between">
              <Typography>Items</Typography>
              <Typography>{cart.items.length}</Typography>
            </Box>

            <Box display="flex" justifycontent="space-between" mt={2}>
              <Typography>Subtotal</Typography>
              <Typography>
                ₹{total.toLocaleString("en-IN")}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box display="flex" justifycontent="space-between">
              <Typography fontWeight="bold">Total</Typography>
              <Typography fontWeight="bold" color="primary">
                ₹{total.toLocaleString("en-IN")}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 3, py: 1.5 }}
              // disabled={!cart.items.length}
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
