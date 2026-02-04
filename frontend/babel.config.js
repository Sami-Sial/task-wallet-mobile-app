module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel",
        ],
        plugins: [
            [
                'module:react-native-dotenv',
                {
                    moduleName: '@env',
                    path: '.env',
                },
            ],
            [
                'module-resolver',
                {
                    root: ['./src'],
                    alias: {
                        '@': './src',
                        '@components': './src/components',
                        '@screens': './src/screens',
                        '@utils': './src/utils',
                    },
                },
            ],
        ],
    };
};