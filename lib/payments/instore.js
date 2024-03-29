const express = require('express');
const common = require('../common');
const { indexOrders } = require('../indexing');
const router = express.Router();

// The homepage of the site
router.post('/checkout_action', async (req, res, next) => {
    const db = req.app.db;
    const config = req.app.config;
    const instoreConfig = common.getPaymentConfig();

    const orderDoc = {
        orderPaymentId: common.getId(),
        orderPaymentGateway: 'Instore',
        orderPaymentMessage: 'Your payment was successfully completed',
        orderTotal: req.session.totalCartAmount,
        orderShipping: 0,
        orderItemCount: req.session.totalCartItems,
        orderProductCount: req.session.totalCartProducts,
        orderCustomer: common.getId(req.session.customerId),
        orderEmail: req.session.customerEmail,
        orderCompany: req.session.customerCompany,
        orderFirstname: req.session.customerFirstname,
        orderLastname: req.session.customerLastname,
        orderAddr1: req.session.customerAddress1,
        orderAddr2: req.session.customerAddress2,
        orderCountry: req.session.customerCountry,
        orderState: req.session.customerState,
        orderPostcode: req.session.customerPostcode,
        orderPhoneNumber: req.session.customerPhone,
        orderComment: req.session.orderComment,
        orderStatus: instoreConfig.orderStatus,
        orderDate: new Date(),
        orderProducts: req.session.cart,
        orderType: 'Single'
    };

    // insert order into DB
    try{
        const newDoc = await db.orders.insertOne(orderDoc);

        // get the new ID
        const newId = newDoc.insertedId;

        // add to lunr index
        indexOrders(req.app)
        .then(() => {
            // set the results
            req.session.messageType = 'success';
            req.session.message = 'Your order was successfully placed. Payment for your order will be completed by Cash on Delivery.';
            req.session.paymentEmailAddr = newDoc.ops[0].orderEmail;
            req.session.paymentApproved = true;
            req.session.paymentDetails = `<p><strong>Order ID: </strong>${newId}</p>
            <p><strong>Transaction ID: </strong>${orderDoc.orderPaymentId}</p>`;

            // set payment results for email
            const paymentResults = {
                message: req.session.message,
                messageType: req.session.messageType,
                paymentEmailAddr: req.session.paymentEmailAddr,
                paymentApproved: true,
                paymentDetails: req.session.paymentDetails
            };

            // clear the cart
            if(req.session.cart){
                common.emptyCart(req, res, 'function');
            }

            // send the email with the response
            // TODO: Should fix this to properly handle result
            common.sendEmail(req.session.paymentEmailAddr, `Your order with ${config.cartTitle}`, common.getEmailTemplate(paymentResults));

            // redirect to outcome
            res.redirect('/payment/' + newId);
        });
    }catch(ex){
        console.log('Error sending payment to API', ex);
        res.status(400).json({ err: 'Your order declined. Please try again' });
    }
});

module.exports = router;
