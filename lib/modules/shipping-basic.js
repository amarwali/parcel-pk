const domesticShippingAmount = 150;
const internationalShippingAmount = 7000;
const freeThreshold = 3000;
const shippingFromCountry = 'Pakistan';

const calculateShipping = (amount, config, req) => {
    // When set to instore shipping is not applicable.
    if(config.paymentGateway === 'instore'){
        // Update message and amount
        req.session.shippingMessage = 'Cash on Delivery';
        req.session.totalCartShipping = 150;
        req.session.totalCartAmount = req.session.totalCartAmount + 150;
        return;
    }

    if(amount >= freeThreshold){
        req.session.shippingMessage = 'Delivery Charges';
        req.session.totalCartShipping = 150;
        req.session.totalCartAmount = req.session.totalCartAmount + 150;
        return;
    }

    // If there is no country set, we estimate shipping
    if(!req.session.customerCountry){
        req.session.shippingMessage = 'Estimated shipping';
        req.session.totalCartShipping = domesticShippingAmount;
        req.session.totalCartAmount = amount + domesticShippingAmount;
        return;
    }

    // Check for international
    if(req.session.customerCountry.toLowerCase() !== shippingFromCountry.toLowerCase()){
        req.session.shippingMessage = 'International shipping';
        req.session.totalCartShipping = internationalShippingAmount;
        req.session.totalCartAmount = amount + internationalShippingAmount;
        return;
    }

    // Domestic shipping
    req.session.shippingMessage = 'Domestic shipping';
    req.session.totalCartShipping = domesticShippingAmount;
    req.session.totalCartAmount = amount + domesticShippingAmount;
};

module.exports = {
    calculateShipping
};
