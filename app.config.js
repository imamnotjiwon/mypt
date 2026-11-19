/**
 * app.json을 기반으로, 웹 배포일 때만 /mypt baseUrl을 켭니다.
 * Expo Go(네이티브)에서는 baseUrl이 있으면 번들/에셋 경로가 깨질 수 있습니다.
 */
module.exports = ({ config }) => {
  const isWebExport =
    process.env.EXPO_WEB_BASEURL === '1' ||
    process.argv.includes('export') ||
    process.argv.includes('--web');

  let apiUrl = config.expo?.extra?.apiUrl;
  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const published = require('./.api-publish/api-config.json');
    if (typeof published.apiUrl === 'string' && published.apiUrl) {
      apiUrl = published.apiUrl;
    }
  } catch {
    /* keep existing */
  }

  return {
    ...config,
    expo: {
      ...config.expo,
      scheme: 'mypt',
      extra: {
        ...config.expo?.extra,
        apiUrl,
      },
      ios: {
        ...config.expo?.ios,
        infoPlist: {
          ...config.expo?.ios?.infoPlist,
          NSMotionUsageDescription: '걸음 수 측정을 위해 동작 및 피트니스 데이터 접근이 필요합니다.',
        },
      },
      experiments: isWebExport ? { baseUrl: '/mypt' } : {},
    },
  };
};
