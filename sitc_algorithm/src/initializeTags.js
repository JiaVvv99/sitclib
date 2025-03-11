import * as d3 from "d3";

import createProjection from "./projection";
import { archimedeanSpiral, genArcPts } from "./archimedeanSpiral";
import updatePosition from "./updatePosition";
import circleColor from "./circleColor";

////// 方法评估 ///////
// import distance from "./expriment/centerDistance";
// import ci from "./expriment/compacknessIndex";
// import pcc from "./expriment/pcc";

/**
 * 初始化标签 修改sortedSIData 添加标签的x y sx sy BBox属性
 * @param {Object} svg d3 svg element
 * @param {Array} sortedSIData 排序后的空间交互数据
 * @param {Object} fontCfg 字体配置对象
 * @param {Array} colorScheme 字体配色
 * @param {String} direction 流向
 * @param {Object} spiralCfg 阿基米德螺线配置
 * @param {Object} isShow 显示与隐藏圆、矩形
 * @param {String} mode 模式
 */

export default function initializeTags(
  svg,
  sortedSIData,
  fontCfg,
  colorScheme,
  direction,
  spiralCfg,
  isShow,
  mode
) {
  d3.select(".main-group").remove(); // 清除已有
  // 初始化元素组别
  const mainG = svg.append("g").attr("class", "main-group");
  const rectG = mainG.append("g").attr("class", "rect-group");
  const circleG = mainG.append("g").attr("class", "circle-group");

  switch (mode) {
    case "S1":
      _drawEle(
        svg,
        sortedSIData,
        mainG,
        rectG,
        circleG,
        fontCfg,
        colorScheme,
        direction,
        spiralCfg,
        isShow
      );

      break;
    case "S2":
      // 单中心，不同尺度
      _drawEle(
        svg,
        sortedSIData,
        mainG,
        rectG,
        circleG,
        fontCfg,
        colorScheme,
        direction,
        spiralCfg,
        isShow
      );
      break;
    case "D1":
      // 双中心，同流向
      _drawEle(
        svg,
        sortedSIData,
        mainG,
        rectG,
        circleG,
        fontCfg,
        colorScheme,
        direction,
        spiralCfg,
        isShow,
        "dobule"
      );
      break;
    case "D2":
      // 双中心，不同流向
      _drawEle(
        svg,
        sortedSIData,
        mainG,
        rectG,
        circleG,
        fontCfg,
        colorScheme,
        direction,
        spiralCfg,
        isShow,
        "dobule",
        "D2"
      );
      break;
    default:
      // 多中心
      _drawEle(
        svg,
        sortedSIData,
        mainG,
        rectG,
        circleG,
        fontCfg,
        colorScheme,
        direction,
        spiralCfg,
        isShow,
        "multi"
      );
      break;
  }
}

/**
 * svg >>> mainG rectG circleG
 * mainG >>> textG(若干) class = source.groupClass
 * textG >>> 中心标签 class = ；关联标签 class = source.groupClass + targets[i].nameClass
 */

// 绘制元素（text, rect, circle）参数同initializeTags
function _drawEle(
  svg,
  sortedSIData,
  mainG,
  rectG,
  circleG,
  fontCfg,
  colorScheme,
  direction,
  spiralCfg,
  isShow,
  centerCount = "single", // 'single' | 'double' | 'multi'
  mode
) {
  // console.log("进入_drawEle");

  // 创建投影
  const svgW = svg.node().clientWidth,
    svgH = svg.node().clientHeight;
  const projection = createProjection(
    [svgW, svgH],
    [
      [73, 122],
      [18, 52],
    ]
  );

  // 所有targets
  const allTargets = sortedSIData
    .map((D) => D.filter((_, i) => i !== 0))
    .flat();
  // console.log('.......',allTargets);

  // 全局字号比例尺
  const globalFSScale = d3
    .scaleLinear()
    .domain(d3.extent(allTargets, (d) => d[direction]))
    .range(fontCfg.fontSizeRange);

  for (let i = 0; i < sortedSIData.length; ++i) {
    // 1. 创建文本组
    const textGroupName = sortedSIData[i][0].groupClass;
    const textGroup = mainG.append("g").attr("class", `${textGroupName}-${i}`);

    // 添加投影位置
    sortedSIData[i].forEach((d) => {
      const projectionPosition = projection(d.crd);
      (d.x = projectionPosition[0]), (d.sx = projectionPosition[0]);
      (d.y = projectionPosition[1]), (d.sy = projectionPosition[1]);
    });

    // 局部字号比例尺
    const fontScale = d3
      .scaleLinear()
      .domain(
        d3.extent(
          sortedSIData[i].filter((_, i) => i !== 0),
          (d) => d[direction]
        )
      )
      .range(fontCfg.fontSizeRange);

    // 2. 创建文本
    const texts = textGroup
      .selectAll(`.text-${i}`)
      .data(sortedSIData[i])
      .join("text")
      .attr("class", (d) => `${d.groupClass}-${i} ${d.nameClass} text-${i}`)
      .classed("center", (_, i) => (i === 0 ? true : false))
      .attr("font-size", (d, _i) => {
        // 双中心，不同流向 模式D2 字号特殊处理
        if (mode === "D2") {
          if (_i === 0) {
            return fontCfg.fontSizeRange[1];
          } else {
            if (i === 0) {
              // 流入
              if (fontCfg.fontSizeScale === "local")
                return fontScale(d.inValue);
              return globalFSScale(d.inValue);
            } else {
              if (fontCfg.fontSizeScale === "local")
                return fontScale(d.outValue);
              return globalFSScale(d.outValue);
            }
          }
        }
        // 其他模式
        if (_i === 0) {
          return fontCfg.fontSizeRange[1];
        } else {
          if (fontCfg.fontSizeScale === "local") return fontScale(d[direction]);
          return globalFSScale(d[direction]);
        }
      })
      .attr("font-family", fontCfg.fontFamily)
      .attr("font-weight", fontCfg.fontWeight)
      .attr("font-style", fontCfg.fontStyle)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("fill", (d) => {
        switch (d.tagClass) {
          case "center":
            return colorScheme[0];
          case "allShared":
            return colorScheme[1];
          case "patialShared":
            return colorScheme[2];
          case "unique":
            return colorScheme[3];
        }
      })
      .text((d) => d.name);

    // 3.计算外接矩形大小
    let sumArea = 0;
    for (let j = 0; j < texts.nodes().length; ++j) {
      const textEle = texts.nodes()[j];
      const { width, height } = textEle.getBBox();
      sumArea += width * height;
      sortedSIData[i][j].BBox = {
        width,
        height,
      };
    }

    // 4.更新标签在阿基米德螺线上的位置
    const maxR = Math.sqrt(sumArea); // 螺线最大半径
    const spiralFn = archimedeanSpiral(spiralCfg); // 螺线函数
    const spiralPts = genArcPts(maxR, spiralFn, [
      // 螺线点数组
      sortedSIData[i][0].x,
      sortedSIData[i][0].y,
    ]);

    // 更新位置
    if (mode !== "D2") {
      updatePosition(sortedSIData[i], spiralPts);
    } else {
      ///// 双中心不同流向 D2 保证关联标签位置一致性
      if (i === 0) {
        updatePosition(sortedSIData[i], spiralPts);
      } else {
        sortedSIData[i].forEach((d, idx) => {
          d.sx = sortedSIData[0][idx].sx;
          d.sy = sortedSIData[0][idx].sy;
        });
      }
    }
    // console.log('updated');

    // 计算外接圆半径
    let centerX = sortedSIData[i][0].sx,
      centerY = sortedSIData[i][0].y,
      circleR = 0;
    sortedSIData[i].forEach((e) => {
      const cx = e.sx,
        cy = e.sy;
      const { width: w, height: h } = e.BBox;
      const vertice = [
        [cx - w / 2, cy - h / 2],
        [cx + w / 2, cy - h / 2],
        [cx + w / 2, cy + h / 2],
        [cx - w / 2, cy - h / 2],
      ];
      let r = 0;
      vertice.forEach((v) => {
        const _r = Math.sqrt((centerX - v[0]) ** 2 + (centerY - v[1]) ** 2);
        if (_r > r) r = _r;
      });

      if (r > circleR) circleR = r;
    });

    sortedSIData[i][0].r = circleR; // 添加外接圆半径

    // 绘制外接矩形
    const provinceName = sortedSIData[i][0].province;
    const rects = rectG
      .selectAll(`.rect-${i}`)
      .data(sortedSIData[i])
      .join("rect")
      .attr(
        "class",
        (d) =>
          `${sortedSIData[i][0].groupClass}-${i}-rects ${d.nameClass} rects rect-${i}`
      )
      .classed("center", (_, i) => (i === 0 ? true : false))
      .attr("x", (d) => d.x - d.BBox.width / 2)
      .attr("y", (d) => d.y - d.BBox.height / 2)
      .attr("width", (d) => d.BBox.width)
      .attr("height", (d) => d.BBox.height)
      .attr("fill", "none")
      .attr("stroke", isShow.rect ? "gray" : "transprent");

    if (centerCount === "single") {
      // 绘制外接圆
      const circle = circleG
        .append("circle")
        .datum({
          name: sortedSIData[i][0].name,
          province: sortedSIData[i][0].province,
          class: `${sortedSIData[i][0].groupClass}-${i}`,
          x: sortedSIData[i][0].x,
          y: sortedSIData[i][0].y,
          r: circleR,
          direction,
        })
        .attr("class", `${sortedSIData[i][0].groupClass}-${i}-circle circles`)
        // .attr("direction", (d) => d.direction)
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("r", circleR)
        .attr("fill", "none")
        .attr("stroke-dasharray", "5 5")
        .attr(
          "stroke",
          isShow.circle ? circleColor[provinceName] ?? "gray" : "transprent"
        );

      // 5.开启力导向模型
      const tagsFS = d3
        .forceSimulation(sortedSIData[i])
        .force(
          "x",
          d3.forceX((d) => d.sx)
        )
        .force(
          "y",
          d3.forceY((d) => d.sy)
        )
        .force("center", d3.forceCenter(svgW / 2, svgH / 2))
        .on("tick", tickFn)
        .on("end", () => {
          console.log("force simulation end");
        });
      function tickFn() {
        texts.attr("x", (d) => d.x).attr("y", (d) => d.y);
        rects
          .attr("x", (d) => d.x - d.BBox.width / 2)
          .attr("y", (d) => d.y - d.BBox.height / 2);
        circle
          .attr("cx", sortedSIData[i][0].x)
          .attr("cy", sortedSIData[i][0].y);
        circle.datum().x = sortedSIData[i][0].x;
        circle.datum().y = sortedSIData[i][0].y;

        // 更新箭头位置
        d3.selectAll(".arrows")?.attr(
          "transform",
          (d) => `translate(${d.x}, ${d.y})`
        );
      }
    }
  }

  //多中心或者双中心
  if (centerCount === "multi" || centerCount === "dobule") {
    // console.log("multi or dobule ===>", centerCount);
    const circles = [];
    // links = []; // 外接圆与其links
    function getDir(idx) {
      if (mode === "D2" && idx === 0) {
        return "inValue";
      } else if (mode === "D2" && idx === 1) {
        return "outValue";
      }
      return direction;
    }
    for (let i = 0; i < sortedSIData.length; i++) {
      circles.push({
        name: sortedSIData[i][0].name,
        province: sortedSIData[i][0].province,
        class: `${sortedSIData[i][0].groupClass}-${i}`,
        sx: sortedSIData[i][0].sx,
        sy: sortedSIData[i][0].sy,
        x: sortedSIData[i][0].x,
        y: sortedSIData[i][0].y,
        r: sortedSIData[i][0].r,
        direction: getDir(i),
      });
    }
    // console.log({ circles });

    // 绘制外接圆
    const circleEles = circleG
      .selectAll("circle")
      .data(circles)
      .join("circle")
      .attr("class", (d, i) => `${d.name}-${i}-circle circles`)
      // .attr("direction", (d) => d.direction)
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", (d) => d.r)
      .attr("fill", "none")
      .attr("stroke-dasharray", "5 5")
      .attr("stroke", (d) =>
        isShow.circle ? circleColor[d.province] ?? "gray" : "transprent"
      );

    // 开启外接圆力导向
    const circlesForceSimulation = d3
      .forceSimulation(circles)
      // .force(
      //   "link",
      //   d3
      //     .forceLink(links)
      //     .id((d) => d.name)
      //     .distance((d) => d.distance)
      // )
      .force(
        "cluster",
        centerCount === "dobule" ? null : forceCluster().strength(1)
      )
      .force("charge", d3.forceManyBody().strength(500))
      .force(
        "collision",
        d3
          .forceCollide()
          .radius((d) => d.r)
          .strength(0.8)
      )
      .force("center", d3.forceCenter(svgW / 2, svgH / 2))
      .on("tick", ciclesTick)
      .on("end", () => {
        console.log("force simulation end");
        // 计算外接圆的移动距离， 并添加到对应的标签上
        circles.forEach((c, i) => {
          const dx = c.x - c.sx,
            dy = c.y - c.sy;
          sortedSIData[i].forEach((tag) => {
            (tag.sx += dx), (tag.sy += dy);
            (tag.x = tag.sx), (tag.y = tag.sy);
          });
        });

        // 更新标签位置
        d3.selectAll("text")
          .transition()
          .duration(500)
          .attr("x", (d) => d.x)
          .attr("y", (d) => d.y);
        // .attr("x", (d) => d.sx)
        // .attr("y", (d) => d.sy);
        // 更新外接矩形
        d3.selectAll("rect")
          .transition()
          .duration(500)
          .attr("x", (d) => d.x - d.BBox.width / 2)
          .attr("y", (d) => d.y - d.BBox.height / 2);
        // .attr("x", (d) => d.sx - d.BBox.width / 2)
        // .attr("y", (d) => d.sy - d.BBox.height / 2);
        // console.log("标签位置更新完毕");
      });

    function ciclesTick() {
      circleEles.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      // 更新箭头位置

      d3.selectAll(".arrows")?.attr(
        "transform",
        (d) => `translate(${d.x}, ${d.y})`
      );
    }
  }
}

// https://observablehq.com/@dianaow/group-clusters

function centroid(nodes) {
  let x = 0;
  let y = 0;
  let z = 0;
  for (const d of nodes) {
    let k = d.r ** 2;
    x += d.x * k;
    y += d.y * k;
    z += k;
  }
  return { x: x / z, y: y / z };
}

function forceCluster() {
  var strength = 0.8;
  let nodes;
  function force(alpha) {
    const centroids = d3.rollup(nodes, centroid, (d) => d.province);
    const l = alpha * strength;
    for (const d of nodes) {
      const { x: cx, y: cy } = centroids.get(d.province);
      d.vx -= (d.x - cx) * l;
      d.vy -= (d.y - cy) * l;
    }
  }
  force.initialize = (_) => (nodes = _);
  force.strength = function (_) {
    return arguments.length ? ((strength = +_), force) : strength;
  };
  return force;
}
