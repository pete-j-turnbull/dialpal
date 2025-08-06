import { useWindowSize } from "usehooks-ts";

export const BREAKPOINT_SM = 640;
export const BREAKPOINT_MD = 768;
export const BREAKPOINT_LG = 1024;
export const BREAKPOINT_XL = 1280;
export const BREAKPOINT_2XL = 1400;

export const useScreenSize = () => {
  const { width, height } = useWindowSize();
  const isMobile = width <= BREAKPOINT_SM;
  const isTablet = width <= BREAKPOINT_MD && width > BREAKPOINT_SM;
  const isDesktop = width > BREAKPOINT_MD;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
  };
};
