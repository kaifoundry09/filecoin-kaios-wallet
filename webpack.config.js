import { URL, fileURLToPath } from "url";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin"
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";
import { createRequire } from 'module';
import path from "path";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// console.log('HtmlWebpackPlugin', HtmlWebpackPlugin)
export default {
    mode: process.env.NODE_ENV || "development",
    entry: "./src/index.js",
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-react"],
                    },
                },
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                  // Creates `style` nodes from JS strings
                  "style-loader",
                  // Translates CSS into CommonJS
                  "css-loader",
                  // Compiles Sass to CSS
                  "sass-loader",
                ],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif|ico)$/,
                exclude: /node_modules/,
                use: ['file-loader?name=[name].[ext]'] // ?name=[name].[ext] is only necessary to preserve the original file name
            }
        ],
    },
    resolve: {
        fallback: {
            "fs": false,
            "tls": false,
            "net": false,
            "zlib": false,
            "http": false,
            "https": false,
            "stream": require.resolve('stream-browserify'),
            // "assert": require.resolve('assert/'),
            // "crypto": require.resolve('crypto-browserify'),
            // "fs": require.resolve('browserify-fs'),
            // "path": require.resolve('path-browserify'),
            // "process": require.resolve('process/browser'),
        //   "crypto-browserify": require.resolve('crypto-browserify'), //if you want to use this module also don't forget npm i crypto-browserify 
        } 
    },
    output: {
        filename: "bundle.js",
        // path: new URL("dist", import.meta.url).pathname,
        path: path.resolve(__dirname, "dist"),
        publicPath: '/'
    },
    devServer: {
        // static: new URL("dist", import.meta.url).pathname,
        static: path.resolve(__dirname, "dist"),
        historyApiFallback: true,
    },
    devtool: 'source-map',
    experiments: {
        asyncWebAssembly: true,
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: "process/browser.js",
        }),
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: './index.html',
            favicon: './public/favicon.ico'
        }),
        new NodePolyfillPlugin(),
        new webpack.ProvidePlugin({
            "React": "react",
        }),
    ],
    // externals: {
    //     'react': 'React'
    // },
    
};
