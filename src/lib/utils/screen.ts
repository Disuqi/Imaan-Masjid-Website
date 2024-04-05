import {ScreenSize} from "@/app/constants";

export function widthToScreenSize(screenWidth) : ScreenSize
{
    let screenSize: ScreenSize = ScreenSize.sm;

    if (screenWidth >= ScreenSize.md) {
        screenSize = ScreenSize.md;
    }
    if (screenWidth >= ScreenSize.lg) {
        screenSize = ScreenSize.lg;
    }
    if (screenWidth >= ScreenSize.xl) {
        screenSize = ScreenSize.xl;
    }
    if (screenWidth >= ScreenSize.xxl) {
        screenSize = ScreenSize.xxl;
    }
    return screenSize;
}