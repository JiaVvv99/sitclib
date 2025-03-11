import { sortSingle1, sortedSingle2, sortDobule1, sortDoubule2 } from "./sort";
import initializeTags from "./initializeTags";
import setInteraction from "./setInteraction";
import drawArrow from "./drawArrow";

/**
 * 生成空间交互标签云
 * @param {object} sitcObj 空间交互标签云对象
 * */

export default function generateSitc(sitcObj) {
  // console.log("generateSitc", sitcObj);
  const {
    sidata,
    svgSelection,
    interaction,
    mode,
    direction,
    spiralCfg,
    font,
    colorScheme,
    isShow,
    arrow,
  } = sitcObj;

  if (!sidata) return;
  let sortedData; // 排序后的空间交互数据
  switch (mode) {
    case "S1":
      console.log("单中心，同尺度");
      if (sidata.length !== 1) {
        console.error(
          "单中心同尺度（S1）模式需要传入一个中心地点的空间交互数据"
        );
        break;
      }
      // 1. 对数据进行排序
      sortedData = sortSingle1(sidata, direction);
      // console.log({sortedData});

      // 2. 初始化标签
      initializeTags(
        svgSelection,
        sortedData,
        font,
        colorScheme,
        direction,
        spiralCfg,
        isShow,
        mode,
        arrow
      );
      break;
    case "S2":
      console.log("单中心，不同尺度");
      if (sidata.length !== 1) {
        console.error(
          "单中心同尺度（S2）模式需要传入一个中心地点的空间交互数据"
        );
        break;
      }
      sortedData = sortedSingle2(sidata, direction);
      initializeTags(
        svgSelection,
        sortedData,
        font,
        colorScheme,
        direction,
        spiralCfg,
        isShow,
        mode
      );
      break;
    case "D1":
      console.log("双中心，同流向");
      if (sidata.length !== 2) {
        console.error(
          "双中心同流向（D1）模式需要传入两个中心地点的空间交互数据"
        );
        break;
      }
      sortedData = sortDobule1(sidata, direction);
      initializeTags(
        svgSelection,
        sortedData,
        font,
        colorScheme,
        direction,
        spiralCfg,
        isShow,
        mode
      );
      break;
    case "D2":
      console.log("双中心，不同流向");
      if (sidata.length !== 1) {
        console.error(
          "双中心不同流向（D2）模式需要传入一个中心地点的空间交互数据"
        );
        break;
      }
      sortedData = sortDoubule2(sidata);
      // console.log(sortedData);
      initializeTags(
        svgSelection,
        sortedData,
        font,
        colorScheme,
        direction,
        spiralCfg,
        isShow,
        mode
      );

      break;
    default:
      console.log("多中心");
      sortedData = sortDobule1(sidata, direction);
      initializeTags(
        svgSelection,
        sortedData,
        font,
        colorScheme,
        direction,
        spiralCfg,
        isShow,
        mode
      );
      break;
  }

  // 绘制箭头
  if (arrow.show && direction !== "totalValue") {
    drawArrow(arrow);
  }
  // 设置交互
  interaction && setInteraction(svgSelection, colorScheme);
}
