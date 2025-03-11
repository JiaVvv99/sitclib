import * as d3 from "d3";
import { inArrow, outArrow } from "./ArrowType";

/**
 * 绘制指向箭头
 * @param {object} arrow 指向箭头的stroke信息
 */

export default function drawArrow(arrow) {
  // 获取所有的外接圆的数据
  const circleG = d3.select("g.circle-group");

  // 清除已经绘制的箭头
  circleG.selectAll(".arrows").remove();

  const data = circleG.selectAll("circle").data();
  // console.log(data);

  // 绘制箭头
  circleG
    .selectAll(".arrows")
    .data(data)
    .join("path")
    .attr("d", (d) => {
      // 箭头缩放系数
      const factor = (2 * d.r) / 64;
      if (d.direction === "inValue") {
        return d3.symbol(inArrow, 64 * factor)();
      } else if (d.direction === "outValue") {
        return d3.symbol(outArrow, 64 * factor)();
      }
    })
    .attr("class", (d) => d.class + "-arrow arrows")
    .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
    .attr("fill", "none")
    .attr("stroke", arrow.stroke.color)
    .attr("stroke-opacity", arrow.stroke.opacity)
    .attr("stroke-width", arrow.stroke.width);
}
