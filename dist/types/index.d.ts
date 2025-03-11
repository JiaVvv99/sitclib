// dist/types/index.d.ts

// 核心类型声明
declare namespace SitcLib {
  /** 空间交互数据格式 */
  type SIData = Array<{
    source: Source;
    targets: Target[];
  }>;

  /** 中心地点定义 */
  interface Source {
    name: string;
    crd: [number, number];
    province: string;
    nameEn: string;
  }

  /** 交互目标地点定义 */
  interface Target extends Source {
    inValue: number;
    outValue: number;
    totalValue: number;
    class?: 1 | 2 | 3; // 仅 S1 模式使用
  }

  /** 配置参数 */
  interface SitcConfig {
    sidata?: SIData | null;
    mode?: ModeType;
    direction?: DirectionType;
    arrow?: ArrowConfig;
    colorScheme?: [string, string, string, string];
    font?: FontConfig;
    isShow?: VisibilityConfig;
    spiralCfg?: SpiralConfig;
    svgSelector?: string;
    svgSelection?: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  }

  /** 箭头配置 */
  interface ArrowConfig {
    show?: boolean;
    stroke?: {
      color?: string;
      opacity?: number;
      width?: number;
    };
  }

  /** 字体配置 */
  interface FontConfig {
    fontSizeRange?: [number, number];
    fontSizeScale?: 'global' | 'local';
    fontFamily?: string;
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
  }

  /** 可见性配置 */
  interface VisibilityConfig {
    circle?: boolean;
    rect?: boolean;
  }

  /** 阿基米德螺线配置 */
  interface SpiralConfig {
    ratio?: number;
    step?: number;
    b?: number;
    a?: 0; // 固定为 0
  }

  /** 模式类型 */
  type ModeType = 'S1' | 'S2' | 'D1' | 'D2' | 'M';

  /** 方向类型 */
  type DirectionType = 'totalValue' | 'inValue' | 'outValue';
}

/** 主类声明 */
declare class Sitc {
  constructor(config?: SitcLib.SitcConfig);

  data(sidata: SitcLib.SIData): this;
  setMode(mode: SitcLib.ModeType): this;
  setDirection(direction: SitcLib.DirectionType): this;
  setArrow(config: Partial<SitcLib.ArrowConfig>): this;
  setColorScheme(colors: [string, string, string, string]): this;
  setFont(config: Partial<SitcLib.FontConfig>): this;
  setShow(config: Partial<SitcLib.VisibilityConfig>): this;
  spiral(config: Partial<SitcLib.SpiralConfig>): this;
  svg(selector: string): this;
  setInteraction(enable: boolean): this;
  layout(): this;
}

// 导出类型（供 TS 用户使用）
export {
  Sitc as default,
  SitcLib
};