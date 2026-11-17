
import api from "./api";

const paymentService = {
    initiatePayment: (paymentRequest) =>
        api.post("/payments", paymentRequest)
};

export default paymentService;
