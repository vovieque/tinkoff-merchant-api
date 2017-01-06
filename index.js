const crypto = require('crypto');
const _ = require('lodash');
const request = require('request');

class TinkoffMerchantAPI {

    /**
     * Constructor
     * @param {String} terminalKey Terminal name
     * @param {String} secretKey Secret key (password) for terminal
     */
    constructor(terminalKey, secretKey) {
        this.terminalKey = terminalKey;
        this.secretKey = secretKey;
    }

    /**
     * Url for API
     */
    static get apiUrl() {
        return 'https://securepay.tinkoff.ru/rest';
    }

    /**
     * Initialize the payment
     * @param {Object} params Params for Init method except TerminalKey and Token
     * @returns {Promise}
     */
    init(params) {
        return this.requestMethod('Init', params);
    }

    /**
     * Initialize the payment
     * @param {Object} params Params for Init method except TerminalKey and Token
     * @returns {Promise}
     */
    init(params) {
        return this.requestMethod('Init', params);
    }

    /**
     * Initialize the payment
     * @param {Object} params Params for Init method except TerminalKey and Token
     * @returns {Promise}
     */
    init(params) {
        return this.requestMethod('Init', params);
    }

    /**
     * Confirm 2-staged payment
     * @param {Object} params Params for Confirm method except TerminalKey and Token
     * @returns {Promise}
     */
    confirm(params) {
        return this.requestMethod('Confirm', params);
    }

    /**
     * Cancel 2-staged payment
     * @param {Object} params Params for Cancel method except TerminalKey and Token
     * @returns {Promise}
     */
    cancel(params) {
        return this.requestMethod('Cancel', params);
    }

    /**
     * Get state of payment
     * @param {Object} params Params for GetState method except TerminalKey and Token
     * @returns {Promise}
     */
    getState(params) {
        return this.requestMethod('GetState', params);
    }

    /**
     * Resend unprocessed notifications
     * @param {Object} params Params for Resend method except TerminalKey and Token
     * @returns {Promise}
     */
    resend(params) {
        return this.requestMethod('Resend', params);
    }

    /**
     * Request API method
     * @param {String} methodName Method name
     * @param {Object} params Params for method except TerminalKey and Token
     * @returns {Promise}
     */
    requestMethod(methodName, params) {
        const methodUrl = `${this.constructor.apiUrl}/${methodName}`;
        const methodParams = Object.assign({}, params);
        methodParams.TerminalKey = this.terminalKey;
        methodParams.Token = this.getToken(methodParams);

        const requestPromise = new Promise((resolve, reject) => {
            request({
                uri: methodUrl,
                method: 'POST',
                form: methodParams,
                json: true,
                gzip: true,
                timeout: 5000
            }, (err, response, body) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(body);
                }
            });
        });

        return requestPromise;
    }

    /**
     * Generates token
     * @param {Object} params Params for method except Token or notification params except Token
     * @returns {String}
     */
    getToken(params) {
        const tokenParams = Object.assign({}, params);
        tokenParams.Password = this.secretKey;
        const pairs = _.toPairs(tokenParams);
        const sortedPairs = _.sortBy(pairs, pair => pair[0]);
        const concatenatedValues = _.reduce(sortedPairs, (result, pair) => result + pair[1], '');
        const token = crypto.createHash('sha256').update(concatenatedValues).digest('hex');

        return token;
    }

    /**
     * Check if notification request is valid
     * @param {Object} req Express (or express-like) request of notification
     * @param {String} req.ip Request IP
     * @param {Object} req.body Params of notification request
     * @returns {Boolean}
     */
    checkNotificationRequest(req) {
        const notificationIpStart = '91.194.226.';
        if (!req.ip.startsWith(notificationIpStart)) {
            return false;
        }
        if (req.body.TerminalKey !== this.terminalKey) {
            return false;
        }

        const tokenParams = Object.assign({}, req.body);
        delete tokenParams.Token;
        if (req.body.Token !== this.getToken(tokenParams)) {
            return false;
        }

        return true;
    }
}

module.exports = TinkoffMerchantAPI;
