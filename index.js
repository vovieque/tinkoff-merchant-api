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
     * @param {Object} params Params for Init method except TerminalKey and Token.
     *     And DATA should be object with DATA-params.
     * @returns {Promise}
     */
    init(params) {
        const dataParamValue = _.toPairs(params.DATA)
            .map(pair => `${pair[0]}=${encodeURIComponent(pair[1])}`)
            .join('|');
        const initParams = Object.assign({}, params);
        initParams.DATA = dataParamValue;
        return this.requestMethod('Init', initParams);
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
                timeout: 25000
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
     * @returns {Object} result
     */
    checkNotificationRequest(req) {
        const notificationIpStart = '91.194.226.';
        // Support ipv6 from ipv4 (like ::ffff:91.194.226.1)
        const ipv4 = req.ip.replace(/^.*:/, '');
        if (!ipv4.startsWith(notificationIpStart)) {
            return {
                success: false,
                error: `Invalid request ip: ${req.ip}`
            };
        }
        if (req.body.TerminalKey !== this.terminalKey) {
            return {
                success: false,
                error: `Invalid request TerminalKey: ${req.body.TerminalKey}`
            };
        }

        const tokenParams = Object.assign({}, req.body);
        delete tokenParams.Token;
        if (req.body.Token !== this.getToken(tokenParams)) {
            return {
                success: false,
                error: `Invalid request Token`
            };
        }

        return {
            success: true
        };
    }
}

module.exports = TinkoffMerchantAPI;
