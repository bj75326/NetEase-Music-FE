import {  } from 'lodash-es';
import storage from './storage';

// 深度合并
export const deepMerge = (
  obj1: { [key: string]: unknown },
  obj2: { [key: string]: unknown },
) => {
  for (const key in obj2) {
    obj1[key] &&
    (obj1[key] as object).toString() === '[object Object]' &&
    obj2[key] &&
    (obj2[key] as object).toString() === '[object Object]'
      ? deepMerge(
          obj1[key] as { [key: string]: unknown },
          obj2[key] as { [key: string]: unknown },
        )
      : (obj1[key] = obj2[key]);
  }
};

// 获取地址栏参数
export const getUrlParam = (name: string): string | null => {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
  const r = window.location.search.substring(1).match(reg);

  if (r !== null) return decodeURIComponent(r[2]);

  return null;
};

// 浏览器信息
export function getBrowser() {
  const { clientHeight, clientWidth } = document.documentElement;

  // 浏览器信息
  const ua = navigator.userAgent.toLowerCase();

  // 浏览器类型
  let type = (ua.match(/firefox|chrome|safari|opera/g) || ['other'])[0];

  if ((ua.match(/msie|trident/g) || [])[0]) {
    type = 'msie';
  }

  // 平台标签
  let tag = '';

  const isTocuh =
    'ontouchstart' in window ||
    ua.indexOf('touch') !== -1 ||
    ua.indexOf('mobile') !== -1;
  if (isTocuh) {
    if (ua.indexOf('ipad') !== -1) {
      tag = 'pad';
    } else if (ua.indexOf('mobile') !== -1) {
      tag = 'mobile';
    } else if (ua.indexOf('android') !== -1) {
      tag = 'androidPad';
    } else {
      tag = 'pc';
    }
  } else {
    tag = 'pc';
  }

  // 浏览器内核
  let prefix = '';

  switch (type) {
    case 'chrome':
    case 'safari':
    case 'mobile':
      prefix = 'webkit';
      break;
    case 'msie':
      prefix = 'ms';
      break;
    case 'firefox':
      prefix = 'Moz';
      break;
    case 'opera':
      prefix = 'O';
      break;
    default:
      prefix = 'webkit';
      break;
  }

  // 操作平台
  const plat =
    ua.indexOf('android') > 0 ? 'android' : navigator.platform.toLowerCase();

  // 屏幕信息
  let screen = 'full';

  if (clientWidth < 768) {
    screen = 'xs';
  } else if (clientWidth < 992) {
    screen = 'sm';
  } else if (clientWidth < 1200) {
    screen = 'md';
  } else if (clientWidth < 1920) {
    screen = 'xl';
  } else {
    screen = 'full';
  }

  // 是否 ios
  const isIOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);

  // 浏览器版本
  const version = (ua.match(/[\s\S]+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1];

  // 是否 PC 端
  const isPC = tag === 'pc';

  // 是否移动端
  const isMobile = isPC ? false : true;

  // 是否移动端 + 屏幕宽过小
  const isMini = screen === 'xs' || isMobile;

  return {
    height: clientHeight,
    width: clientWidth,
    version,
    type,
    plat,
    tag,
    prefix,
    isMobile,
    isIOS,
    isPC,
    isMini,
    screen
  };
}

export { storage };
export * from './loading';
export * from './data';
