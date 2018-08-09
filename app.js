var connect = require('connect-sdk-client-js/dist/connectsdk.noEncrypt');

var sessionDetails = {
    clientSessionID: '04a1e04685014fdca6d604062b5d2bfa',
    customerId: '1868-250e683584ef4117b391fe0c1aa32dfc',
    clientApiUrl: 'https://eu.sandbox.api-ingenico.com/client/v1',
    assetUrl: '/'
};

var paymentDetails = {
    totalAmount: 10000,
    countryCode: 'NL',
    locale: 'en_US',
    currency: 'EUR',
    isRecurring: false
};

var paymentProductSpecificInputs = {
    androidPay: {
        merchantId: "<your Android Pay merchant id>"
    }
};

var paymentProductId = "809";

var paymentProductId2 = "9000";

var searchParameters = {
    "countryCode": "SE",
    "values": [{
        "key": "fiscalNumber",
        "value": "012345678901"
    }]
};


var currencyCode = "EUR";

var countryCode = "NL";

var cardNumber = '4567 3500 0042 7977';

var session = new connect(sessionDetails);

var createPayload = function (session, cardNumber, paymentDetails) {
    session.getIinDetails(cardNumber, paymentDetails).then(function (iinDetailsResponse) {
        if (iinDetailsResponse.status !== "SUPPORTED") {
            console.error("Card check error: " + iinDetailsResponse.status);
            document.querySelector('.output').innerText = 'Something went wrong, check the console for more information.';
            return;
        }
        session.getPaymentProduct(iinDetailsResponse.paymentProductId, paymentDetails).then(function (paymentProduct) {
            var paymentRequest = session.getPaymentRequest();
            paymentRequest.setPaymentProduct(paymentProduct);
            paymentRequest.setValue("cardNumber", cardNumber);
            paymentRequest.setValue("cvv", "123");
            paymentRequest.setValue("expiryDate", "04/20");

            if (!paymentRequest.isValid()) {
                for (var error in paymentRequest.getErrorMessageIds()) {
                    console.error('error', error);
                }
            }
            session.getEncryptor().encrypt(paymentRequest).then(function (paymentHash) {
                //public key
                session.getPublicKey().then(function(publicKey) {
                    console.log('publicKey', publicKey);
                }, function(error) {
                    console.log('error public key: ', error);
                })
                //payment product groups
                session.getBasicPaymentProductGroups(paymentDetails).then(function (basicPaymentProductGroups) {
                    console.log('basicPaymentProductGroups',basicPaymentProductGroups)
                }, function (error) {
                    console.log('error basic payment:', error)
                });
                //payment product group
                session.getPaymentProductGroup('cards', paymentDetails).then(function (paymentProductGroup) {
                    console.log('paymentProductGroup', paymentProductGroup);
                }, function (error) {
                    // Indicate that an error occurred
                    console.log('paymentProductGroup: error: ', error);
                });
                //payment products specific inputs
                session.getBasicPaymentProducts(paymentDetails, paymentProductSpecificInputs).then(function (basicPaymentProducts) {
                    // Process basic payment products
                    console.log('basicPaymentProducts', basicPaymentProducts)
                }, function (error) {
                    // Indicate that an error occurred
                    console.log('basicPaymentProducts', error);
                });
                //get payment product details
                session.getPaymentProduct(paymentProductId, paymentDetails, paymentProductSpecificInputs).then(function (paymentProduct) {
                    // Process basic payment products
                    console.log('paymentProduct', paymentProduct)
                }, function (error) {
                    // Indicate that an error occurred
                    console.log('paymentProduct', error);
                });
                //ideal get payment product directory
                session.getPaymentProductDirectory(paymentProductId, currencyCode, countryCode).then(function (paymentProductDirectory) {
                    console.log('paymentProductDirectory', paymentProductDirectory);
                }, function (error) {
                    console.log(error);
                });
                //get customer details
                session.getCustomerDetails(paymentProductId2, searchParameters).then(function (paymentProductCustomerDetails) {
                    console.log('paymentProductCustomerDetails', paymentProductCustomerDetails)
                }, function (error) {
                    console.log('paymentProductCustomerDetails ERROR: ',error);
                });


                document.querySelector('.output').innerText = 'Encrypted to: ' + paymentHash;
            }, function (errors) {
                console.error('Failed encrypting the payload, check your credentials');
                document.querySelector('.output').innerText = 'Something went wrong, check the console for more information.';
            });

        }, function () {
            console.error('Failed getting payment product, check your credentials');
            document.querySelector('.output').innerText = 'Something went wrong, check the console for more information.';
        });

    }, 
    function () {
        console.error('Failed getting IinDetails, check your credentials');
        document.querySelector('.output').innerText = 'Something went wrong, check the console for more information.';
    });
}

createPayload(session, cardNumber, paymentDetails);
