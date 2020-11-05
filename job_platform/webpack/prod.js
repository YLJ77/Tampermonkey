const { merge } = require('webpack-merge');
const base = require('./base')

const prod = {
    mode: 'development'
};

module.exports = merge(base,prod);