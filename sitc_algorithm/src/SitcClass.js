import Base from "./BaseClass";
import generateSitc from "./generateSitc";

const modes = ["S1", "S2", "D1", "D2", "M"];
const directions = ["inValue", "outValue", "totalValue"];
const fontWeights = ["normal", "bold"];
const fontStyles = ["normal", "italic"];
const fontSizeScales = ["global", "local"];

export default class Sitc extends Base {
  constructor(sidata) {
    super();
    // 初始化画布
    super.initializeSvg(this.svgSelector);

    // 初始化空间交互数据
    this.sidata = Array.isArray(sidata) ? sidata : null;
  }
  /**
   * 指定空间交互数据
   * @param {Array} _
   * @returns sitcObj
   */
  data(_) {
    Array.isArray(_) && (this.sidata = _);
    return this;
  }

  /**
   * 指定svg的css选择器
   * */
  svg(selector) {
    if (selector) {
      super.initializeSvg(selector);
    }
    return this;
  }

  /**
   * 设置阿基米德螺线参数
   * @param {object} _
   */
  spiral(_) {
    // 宽高比 number类型 取值范围 [0.5, 1.5] 默认值1
    typeof _.ratio === "number" &&
      _.ratio >= 0.5 &&
      _.ratio <= 1.5 &&
      (this.spiralCfg.ratio = _.ratio);

    // 步长 number类型 取值范围 [0.01, 1] 默认值 0.1
    typeof _.step === "number" &&
      _.step >= 0.01 &&
      _.step <= 1 &&
      (this.spiralCfg.step = _.step);

    // 螺距 number类型 取值范围 [0.1, 1.5] 默认值 1
    typeof _.b === "number" &&
      _.b >= 0.1 &&
      _.b <= 1.5 &&
      (this.spiralCfg.b = _.b);
    // _.a && (this.spiralCfg.a = _.a);
    // _.show && (this.spiralCfg.show = _.show);
    return this;
  }

  /**
   * 指定模式,必须为"S1", "S2", "D1", "D2", "M"中的一种，否则为"S1"
   */
  setMode(_) {
    if (modes.includes(_)) {
      this.mode = _;
    }
    return this;
  }

  /**
   * 指定字体相关配置
   */
  setFont(_) {
    // 字号范围 长度为2
    Array.isArray(_.fontSizeRange) &&
      _.fontSizeRange.length === 2 &&
      (this.font.fontSizeRange = _.fontSizeRange);

    fontSizeScales.includes(_.fontSizeScale) &&
      (this.font.fontSizeScale = _.fontSizeScale);
    _.fontFamily && (this.font.fontFamily = _.fontFamily);
    fontWeights.includes(_.fontWeight) && (this.font.fontWeight = _.fontWeight);
    fontStyles.includes(_.fontStyle) && (this.font.fontStyle = _.fontStyle);
    return this;
  }

  /**
   * 指定色带，需要传入一个颜色数组
   */
  setColorScheme(_) {
    // 传入一个数组
    if (Array.isArray(_)) {
      _[0] && (this.colorScheme[0] = _[0]);
      _[1] && (this.colorScheme[1] = _[1]);
      _[2] && (this.colorScheme[2] = _[2]);
      _[3] && (this.colorScheme[3] = _[3]);
    }
    return this;
  }

  /*
   *  设置显示与隐藏
   */
  setShow(_) {
    _.circle && (this.isShow.circle = _.circle);
    _.rect && (this.isShow.rect = _.rect);
    return this;
  }

  /**
   * 设置方向，传入参数需要为"inValue", "outValue", "totalValue"之一， 默认值"totalValue"
   * */
  setDirection(_) {
    if (directions.includes(_)) {
      this.direction = _;
    }
    return this;
  }

  /**
   * 设置指向箭头
   */
  setArrow(_) {
    typeof _.show === "boolean" && (this.arrow.show = _.show);

    // stroke
    _.stroke?.["color"] && (this.arrow.stroke["color"] = _.stroke["color"]);
    // opacity取值范围为[0,1]
    _.stroke?.["opacity"] &&
      _.stroke["opacity"] >= 0 &&
      _.stroke["opacity"] <= 1 &&
      (this.arrow.stroke["opacity"] = _.stroke["opacity"]);
    // width取值范围为
    _.stroke?.["width"] &&
      typeof _.stroke["width"] === "number" &&
      // _.stroke["width"] >= 0 &&
      // _.stroke["width"] <= 1 &&
      (this.arrow.stroke["width"] = _.stroke["width"]);

    return this;
  }

  /**
   * 设置交互
   */
  setInteraction(_) {
    if (typeof _ === "boolean") {
      this.interaction = _;
    }
    return this;
  }

  /**
   * 绘制sitc
   */
  layout() {
    setTimeout(() => {
      generateSitc(this);
    }, 0);
    return this;
  }
}
