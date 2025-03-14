/**
 * 抽象基类，存储初始信息
 * */
import * as d3 from "d3";
export default class Base {
  constructor() {
    if (new.target === Base) {
      throw new Error("抽象基类Base,不能直接实例化");
    }
    this.svgSelection = null;
    this.interaction = true; // 设置交互行为，默认为true
    this.mode = "S1"; //默认模式，单中心(S1：同尺度；S2:不同尺度)， 双中心(D1:同流向；D2：不同流向)， 多中心(M)
    this.direction = "totalValue"; //流向： 对应数据中的 in/out/totalValue
    this.svgSelector = "#sitc-svg"; // 默认的svg的css选择器

    // 默认阿基米德螺线配置
    this.spiralCfg = {
      ratio: 1, // 螺线长宽比
      step: 0.1, // 步长
      b: 1, // 螺距
      a: 0, // 起始点偏移量
      // show: false, // 是否显示阿基米德螺线
    };

    // 默认字体配置
    this.font = {
      fontSizeRange: [16, 40],
      fontSizeScale: "global", // global | local
      fontFamily: "微软雅黑",
      fontWeight: "normal",
      fontStyle: "normal",
    };

    // 默认配色
    this.colorScheme = ["red", "green", "yellow", "blue"];

    // 默认显示与隐藏
    this.isShow = {
      circle: false,
      rect: false,
    };

    // 配置指向箭头
    this.arrow = {
      show: true,
      stroke: {
        color: "#333",
        opacity: 0.8,
        width: 1,
      },
    };
  }

  // 初始化画布
  initializeSvg(selector) {
    try {
      this.svgSelection = d3.select(selector);
    } catch (e) {
      console.error("指定svg画布出错：", e);
    }

    return this.svgSelection;
  }

  // 验证空间交互数据结构是否正确
  validateFullStructure(data) {
    return (
      Array.isArray(data) &&
      data.every((item) => {
        // 验证中心点
        const validSource =
          item.source &&
          typeof item.source.name === "string" &&
          Array.isArray(item.source.crd) &&
          item.source.crd.length === 2 &&
          typeof item.source.province === "string";

        // 验证目标点
        const validTargets =
          Array.isArray(item.targets) &&
          item.targets.every(
            (target) =>
              typeof target.name === "string" &&
              Array.isArray(target.crd) &&
              target.crd.length === 2 &&
              typeof target.province === "string" &&
              typeof target.inValue === "number" &&
              typeof target.outValue === "number" &&
              typeof target.totalValue === "number"
          );

        return validSource && validTargets;
      })
    );
  }
}
