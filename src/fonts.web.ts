export function useAppFonts(): [boolean, Error | null] {
  if (typeof document !== 'undefined' && !document.getElementById('mypt-pretendard')) {
    const style = document.createElement('style');
    style.id = 'mypt-pretendard';
    style.textContent = `
      @font-face { font-family: 'Pretendard-Regular'; src: url('https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/static/woff2/Pretendard-Regular.woff2') format('woff2'); font-weight: 400; font-display: swap; }
      @font-face { font-family: 'Pretendard-Medium'; src: url('https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/static/woff2/Pretendard-Medium.woff2') format('woff2'); font-weight: 500; font-display: swap; }
      @font-face { font-family: 'Pretendard-SemiBold'; src: url('https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/static/woff2/Pretendard-SemiBold.woff2') format('woff2'); font-weight: 600; font-display: swap; }
      @font-face { font-family: 'Pretendard-Bold'; src: url('https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/static/woff2/Pretendard-Bold.woff2') format('woff2'); font-weight: 700; font-display: swap; }
      @font-face { font-family: 'Pretendard-ExtraBold'; src: url('https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/static/woff2/Pretendard-ExtraBold.woff2') format('woff2'); font-weight: 800; font-display: swap; }
    `;
    document.head.appendChild(style);
  }
  return [true, null];
}
