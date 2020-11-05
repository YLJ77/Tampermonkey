const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, '../src/main.js'),
    output: {
        filename: 'job_list.user.js',
        path: path.resolve(__dirname, '../dist'),
    },
    resolve: {
        alias: {
            src: path.resolve(__dirname, '../src'),
        }
    },
    module: {
        rules: [
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'less-loader'
                ],
            },
        ],
    },
};