module.exports = function (api) {
  api.cache.using(() => process.env.NODE_ENV);
  const isTest = process.env.NODE_ENV === 'test';
  return {
    presets: [
      [
        'babel-preset-expo',
        isTest ? {} : { jsxImportSource: 'nativewind' },
      ],
      ...(isTest ? [] : ['nativewind/babel']),
    ],
    plugins: [
      ['module-resolver', {
        root: ['./'],
        alias: {
          '@/components': './components',
          '@/context': './context',
          '@/hooks': './hooks',
          '@/utils': './utils',
          '@/locales': './locales',
          '@/screens': './screens',
          '@/navigation': './navigation',
          '@/theme': './theme',
          '@/constants': './constants',
        },
      }],
      'react-native-reanimated/plugin',
    ],
  };
};
