/**
 * Webpack Config
 *
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (http://scar.tw)
 * @link        https://github.com/scarwu/MHRCalculator
 */

const path = require('path')
const marked = require('marked')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const BrotliPlugin = require('brotli-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
    mode: process.env.NODE_ENV,
    devtool: 'source-map',
    entry: {
        main: './src/scripts/main.jsx',
        worker: './src/scripts/worker.js'
    },
    output: {
        filename: (process.env.NODE_ENV === 'production') ? 'scripts/[name].[chunkhash].js' : 'scripts/[name].js',
        chunkFilename: 'scripts/[name].[chunkhash].js',
        globalObject: 'self'
    },
    resolve: {
        modules: [
            path.resolve('./src/scripts'),
            'node_modules'
        ],
        extensions: [
            '.js',
            '.jsx'
        ],
        alias: {
            '@': path.resolve('./src')
        }
    },
    optimization: ((process.env.NODE_ENV !== 'production') ? {
        moduleIds: 'named',
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false
    } : {
        moduleIds: 'deterministic',
        // splitChunks: {
        //     chunks: 'all',
        //     name: 'vendor'
        // },
        // runtimeChunk: {
        //     name: 'manifest'
        // },
        minimizer: [
            new CssMinimizerPlugin({
                parallel: true,
                minify: CssMinimizerPlugin.esbuildMinify
            }),
            new TerserPlugin({
                minify: TerserPlugin.swcMinify,
                extractComments: false,
                terserOptions: {
                    ecma: 5
                }
            })
        ]
    }),
    module: {
        rules: [
            {
                test: /.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        plugins: [
                            // Stage 0
                            '@babel/plugin-proposal-function-bind',

                            // Stage 1
                            '@babel/plugin-proposal-export-default-from',
                            '@babel/plugin-proposal-logical-assignment-operators',
                            ['@babel/plugin-proposal-optional-chaining', { 'loose': false }],
                            ['@babel/plugin-proposal-pipeline-operator', { 'proposal': 'minimal' }],
                            ['@babel/plugin-proposal-nullish-coalescing-operator', { 'loose': false }],
                            '@babel/plugin-proposal-do-expressions',

                            // Stage 2
                            ['@babel/plugin-proposal-decorators', { 'legacy': true }],
                            '@babel/plugin-proposal-function-sent',
                            '@babel/plugin-proposal-export-namespace-from',
                            '@babel/plugin-proposal-numeric-separator',
                            '@babel/plugin-proposal-throw-expressions',

                            // Stage 3
                            '@babel/plugin-syntax-dynamic-import',
                            '@babel/plugin-syntax-import-meta',
                            ['@babel/plugin-proposal-class-properties', { 'loose': false }],
                            '@babel/plugin-proposal-json-strings',
                            'babel-plugin-react-scoped-css'
                        ],
                        presets: [
                            ['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3 }],
                            '@babel/preset-react'
                        ]
                    }
                }
            },
            {
                test: /\.(sc|c|sa)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: (process.env.NODE_ENV !== 'production'),
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: (process.env.NODE_ENV !== 'production')
                        }
                    },
                    {
                        loader: 'scoped-css-loader'
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: (process.env.NODE_ENV !== 'production'),
                            sassOptions: {
                                // indentedSyntax: true
                            }
                        }
                    }
                ]
            },
            {
                test: /\.md$/,
                use: [
                    {
                        loader: 'html-loader'
                    },
                    {
                        loader: 'markdown-loader',
                        options: {
                            pedantic: true,
                            renderer: new marked.Renderer()
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        // new webpack.optimize.ModuleConcatenationPlugin(),
        new MiniCssExtractPlugin((process.env.NODE_ENV === 'production') ? {
            filename: 'styles/[name].[chunkhash].css'
        } : {
            filename: 'styles/[name].css'
        }),
        ...((process.env.NODE_ENV !== 'production') ? [
            // new webpack.HotModuleReplacementPlugin()
        ] : [
            new CompressionPlugin({
                filename: '[path][base].gz[query]',
                algorithm: 'gzip',
                test: /\.js$|\.css$|\.html$|\.svg$/,
                threshold: 10240,
                minRatio: 0.7
            }),
            new BrotliPlugin({
                asset: '[path].br[query]',
                test: /\.js$|\.css$|\.html$|\.svg$/,
                threshold: 10240,
                minRatio: 0.7
            })
        ])
    ]
}