// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  resolver: {
    assetExts: [...defaultConfig.resolver.assetExts, 'db'],
  },
};
