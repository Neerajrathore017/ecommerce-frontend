import api from "./api";

const orderService = {
    createOrder: (paymentMethod) =>
        api.post("/orders", {
            paymentMethod: paymentMethod
        })
};

export default orderService;