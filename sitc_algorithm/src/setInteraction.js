/**
 * 设置空间交互标签云的交互
 * @param {object} svg d3 svg selection
 * @param {Array} colorScheme 色带
 * */
import * as d3 from "d3";
export default function setInteraction(svg, colorScheme) {
  const mainG = svg.select("g.main-group");
  // console.log(mainG);
  mainG.selectAll("circle").attr("stroke-width", 2);

  // 整个画布的平移与缩放
  const zoom = d3.zoom().on("zoom", zoomed);
  svg.call(zoom);
  function zoomed(e) {
    const { k, x, y } = e.transform;
    mainG.style("transform", `translate(${x}px, ${y}px) scale(${k})`);
  }

  const drag = d3
    .drag()
    // .container(svg)
    .on("start", function (e, d) {
      // console.log("drag start");
      // console.log({ e, d });
      // console.log(this.parentNode);
      const textName = this.classList[0];
      // console.log(textName);
      // 选中对应的标签、外接圆、外接矩形
      d3.selectAll(`text.${textName}`).attr("fill-opacity", 0.5);
      d3.selectAll(`circle.${textName}-circle`).attr("stroke-opacity", 0.5);
      d3.selectAll(`rect.${textName}-rects`).attr("stroke-opacity", 0.5);
    })
    .on("drag", function (e, d) {
      // console.log("draging");
      // console.log(e, d);
      const textName = this.classList[0];

      const mx = e.x - d.x,
        my = e.y - d.y;

      // 更新位置(文本、外接圆、矩形)
      d3.selectAll(`text.${textName}`)
        .attr("x", (d) => d.x + mx)
        .attr("y", (d) => d.y + my);
      d3.selectAll(`circle.${textName}-circle`)
        .attr("cx", (d) => d.x + mx)
        .attr("cy", (d) => d.y + my);
      d3.selectAll(`rect.${textName}-rects`)
        .attr("x", (d) => d.x + mx - d.BBox.width / 2)
        .attr("y", (d) => d.y + my - d.BBox.height / 2);

      // 更新位置箭头
      d3.selectAll(`path.${textName}-arrow`).attr(
        "transform",
        (d) => `translate(${d.x + mx}, ${d.y + my})`
      );
    })
    .on("end", function (e, d) {
      // console.log("drag end");
      // console.log({ e, d });
      const textName = this.classList[0];
      const texts = d3.selectAll(`text.${textName}`).attr("fill-opacity", 1);
      const circle = d3
        .selectAll(`circle.${textName}-circle`)
        .attr("stroke-opacity", 1);
      d3.selectAll(`rect.${textName}-rects`).attr("stroke-opacity", 1);

      const mx = e.x - d.x,
        my = e.y - d.y;
      // 更新数据
      texts.data().forEach((t) => {
        (t.x += mx), (t.y += my);
      });
      circle.data().forEach((c) => {
        (c.x += mx), (c.y += my);
      });
    });

  // 拖拽中心标签 拖拽标签簇、外接圆与矩形
  const centerTags = mainG.selectAll("text.center").style("cursor", "pointer");
  centerTags.call(drag);

  // 鼠标移入关联标签 高亮所有同名标签
  const targetTags = mainG
    .selectAll("text:not(.center)")
    .style("cursor", "default");
  targetTags
    .on("mouseover", function () {
      const tagClass = this.classList[1];

      // 高亮同名标签
      d3.selectAll(`text.${tagClass}:not(.center)`).attr("fill", "black");
      d3.selectAll(`rect.${tagClass}:not(.center)`)
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
        .attr("ry", (d) => d.BBox.height * 0.2);
    })
    .on("mouseleave", function () {
      const tagClass = this.classList[1];

      // 恢复样式
      d3.selectAll(`text.${tagClass}:not(.center)`).attr("fill", (d) => {
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
      });
      d3.selectAll(`rect.${tagClass}:not(.center)`)
        .attr("fill", "none")
        .attr("ry", 0);
    });
}
