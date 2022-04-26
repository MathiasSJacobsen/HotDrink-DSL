// @ts-check
const path = require('path');

const outputPath = path.resolve(__dirname, 'webpackout');

/**@type {import('webpack').Configuration}*/
const webviewConfig = {
    target: 'web',

    entry: path.resolve(__dirname, 'src/webview/main.ts'),
    output: {
		filename: 'webview.js',
        path: outputPath
    },
    //devtool: 'eval-source-map',

    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ['ts-loader']
            },
            /* {
                test: /\.js$/,
                use: ['source-map-loader'],
                enforce: 'pre'
            }, */
            {
                test: /\.css$/,
                exclude: /\.useable\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(ttf)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: '',
                    publicPath: '..',
                    postTransformPublicPath: (p) => `__webpack_public_path__ + ${p}`,
                }
            },
        ]
    }
};

/**@type {import('webpack').Configuration}*/
const languageServerConfig = {
    target: 'node',

    entry: path.resolve(__dirname, 'src/language-server/main.ts'),
    output: {
		filename: 'language-server.js',
        path: outputPath
    },
    devtool: 'nosources-source-map',

    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ['ts-loader']
            },
            /* {
                test: /\.js$/,
                use: ['source-map-loader'],
                enforce: 'pre'
            } */
        ]
    }
};

/**@type {import('webpack').Configuration}*/
const extensionConfig = {
    target: 'node', 

    entry: path.resolve(__dirname, 'src/extension.ts'),
    output: { 
        path: outputPath,
        filename: 'extension.js',
        libraryTarget: "commonjs2",
        devtoolModuleFilenameTemplate: "../[resource-path]",
    },
    devtool: 'source-map',
    externals: {
        vscode: "commonjs vscode"
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: ['ts-loader']
            },
            /* {
                test: /\.js$/,
                enforce: 'pre',
                use: ['source-map-loader'],
            } */
        ]
    },
}

module.exports = [webviewConfig, extensionConfig, languageServerConfig];