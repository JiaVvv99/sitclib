import * as d3 from "d3";
class Base {
  constructor() {
    if (new.target === Base) {
      throw new Error("抽象基类Base,不能直接实例化");
    }
    this.svgSelection = null;
    this.interaction = true;
    this.mode = "S1";
    this.direction = "totalValue";
    this.svgSelector = "#sitc-svg";
    this.spiralCfg = {
      ratio: 1,
      // 螺线长宽比
      step: 0.1,
      // 步长
      b: 1,
      // 螺距
      a: 0
      // 起始点偏移量
      // show: false, // 是否显示阿基米德螺线
    };
    this.font = {
      fontSizeRange: [16, 40],
      fontSizeScale: "global",
      // global | local
      fontFamily: "微软雅黑",
      fontWeight: "normal",
      fontStyle: "normal"
    };
    this.colorScheme = ["red", "green", "yellow", "blue"];
    this.isShow = {
      circle: false,
      rect: false
    };
    this.arrow = {
      show: true,
      stroke: {
        color: "#333",
        opacity: 0.8,
        width: 1
      }
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
    return Array.isArray(data) && data.every((item) => {
      const validSource = item.source && typeof item.source.name === "string" && Array.isArray(item.source.crd) && item.source.crd.length === 2 && typeof item.source.province === "string";
      const validTargets = Array.isArray(item.targets) && item.targets.every(
        (target) => typeof target.name === "string" && Array.isArray(target.crd) && target.crd.length === 2 && typeof target.province === "string" && typeof target.inValue === "number" && typeof target.outValue === "number" && typeof target.totalValue === "number"
      );
      return validSource && validTargets;
    });
  }
}
function sortSingle1(data, direction) {
  const targets = data[0].targets;
  targets.sort((a, b) => {
    if (b[direction] !== a[direction]) {
      return b[direction] - a[direction];
    } else {
      return b.name.length - a.name.length;
    }
  });
  data[0].source.tagClass = "center";
  data[0].source.groupClass = `${data[0].source.name}`;
  data[0].source.nameClass = `${data[0].source.name}`;
  targets.forEach((t) => {
    t.tagClass = "unique";
    t.groupClass = `${data[0].source.name}`;
    t.nameClass = `${t.name}`;
  });
  return [[data[0].source, ...targets]];
}
function sortedSingle2(data, direction) {
  const source = data[0].source;
  source.tagClass = "center";
  source.groupClass = data[0].source.name;
  source.nameClass = data[0].source.name;
  const targets = data[0].targets;
  const city = targets.filter((d) => d.class === 1);
  const province = targets.filter((d) => d.class === 2);
  const country = targets.filter((d) => d.class === 3);
  city.forEach((d) => {
    d.tagClass = "allShared";
    d.groupClass = source.name;
    d.nameClass = d.name;
  });
  province.forEach((d) => {
    d.tagClass = "patialShared";
    d.groupClass = source.name;
    d.nameClass = d.name;
  });
  country.forEach((d) => {
    d.tagClass = "unique";
    d.groupClass = source.name;
    d.nameClass = d.name;
  });
  _sort(city, direction);
  _sort(province, direction);
  _sort(country, direction);
  return [[source, ...city, ...province, ...country]];
}
function sortDobule1(data, direction) {
  const sorted = [], allTargets = [];
  for (let i = 0; i < data.length; ++i) {
    data[i].source.tagClass = "center";
    data[i].source.groupClass = data[i].source.name;
    data[i].source.nameClass = data[i].source.name;
    allTargets.push(...data[i].targets);
  }
  const count = allTargets.reduce((pre, cur) => {
    if (!pre[cur.name]) {
      pre[cur.name] = 1;
      return pre;
    }
    pre[cur.name] += 1;
    return pre;
  }, {});
  for (let i = 0; i < data.length; ++i) {
    const allShared = [], patialShared = [], unique = [];
    const targets = data[i].targets;
    targets.forEach((t) => {
      t.groupClass = `${data[i].source.name}`;
      t.nameClass = `${t.name}`;
      if (count[t.name] === data.length) {
        t.tagClass = "allShared";
        allShared.push(t);
      } else if (count[t.name] === 1) {
        t.tagClass = "unique";
        unique.push(t);
      } else {
        t.tagClass = "patialShared";
        patialShared.push(t);
      }
    });
    _sort(allShared, direction);
    _sort(patialShared, direction);
    _sort(unique, direction);
    sorted.push([data[i].source, ...allShared, ...patialShared, ...unique]);
  }
  return sorted;
}
function sortDoubule2(data) {
  const targets = data[0].targets;
  _sort(targets, "totalValue");
  data[0].source.tagClass = "center";
  data[0].source.groupClass = `${data[0].source.name}`;
  data[0].source.nameClass = `${data[0].source.name}`;
  targets.forEach((t) => {
    if (t.inValue === t.outValue) {
      t.tagClass = "allShared";
    } else if (t.inValue > t.outValue) {
      t.tagClass = "patialShared";
    } else {
      t.tagClass = "unique";
    }
    t.groupClass = `${data[0].source.name}`;
    t.nameClass = `${t.name}`;
  });
  const targetsCopy = targets.map((D) => {
    const _crd = D.crd.map((d, i) => i === 0 ? d + 1 : d);
    return {
      ...D,
      crd: _crd
    };
  });
  const _sourceCrd = data[0].source.crd.map((d, i) => i === 0 ? d + 5 : d);
  const clone = [{ ...data[0].source, crd: _sourceCrd }, ...targetsCopy];
  return [[data[0].source, ...targets], clone];
}
function _sort(data, direction) {
  data.sort((a, b) => {
    if (b[direction] !== a[direction]) {
      return b[direction] - a[direction];
    } else {
      return b.name.length - a.name.length;
    }
  });
}
function createProjection(svgSize, crdRange) {
  return (crd) => {
    const x = (crd[0] - crdRange[0][0]) / (crdRange[0][1] - crdRange[0][0]) * svgSize[0];
    const y = svgSize[1] - (crd[1] - crdRange[1][0]) / (crdRange[1][1] - crdRange[1][0]) * svgSize[1];
    return [x, y];
  };
}
function archimedeanSpiral({ ratio = 1, step = 0.1, b = 0.1, a = 0 } = {}) {
  const e = ratio;
  return function(t) {
    return [e * (a + b * (t *= step)) * Math.cos(t), (a + b * t) * Math.sin(t)];
  };
}
function genArcPts(maxR, getPosi, start = [0, 0]) {
  const pts = [];
  let t = 0, dxdy;
  while (dxdy = getPosi(t += 1)) {
    let dx = dxdy[0];
    let dy = dxdy[1];
    const r = Math.sqrt(dx ** 2 + dy ** 2);
    if (r > maxR) break;
    pts.push([dx + start[0], dy + start[1]]);
  }
  return pts;
}
function isColliding(rect1, rect2) {
  const t1 = rect1.sy - rect1.BBox.height / 2, r1 = rect1.sx + rect1.BBox.width / 2, b1 = rect1.sy + rect1.BBox.height / 2, l1 = rect1.sx - rect1.BBox.width / 2;
  const t2 = rect2.sy - rect2.BBox.height / 2, r2 = rect2.sx + rect2.BBox.width / 2, b2 = rect2.sy + rect2.BBox.height / 2, l2 = rect2.sx - rect2.BBox.width / 2;
  const w12 = rect1.BBox.width + rect2.BBox.width, h12 = rect1.BBox.height + rect2.BBox.height;
  const wMax = Math.max(Math.abs(l1 - r2), Math.abs(l2 - r1));
  const hMax = Math.max(Math.abs(t1 - b2), Math.abs(t2 - b1));
  if (wMax < w12 && hMax < h12) {
    return true;
  }
  return false;
}
function updatePosition(textRects, spiralPts) {
  const updated = [];
  const first = textRects[0];
  updated.push(first);
  for (let i = 1; i < textRects.length; i++) {
    const newRect = textRects[i];
    newRect.sx = spiralPts[i][0];
    newRect.sy = spiralPts[i][1];
    if (isCollision(newRect, updated)) {
      let m = i;
      while (isCollision(newRect, updated)) {
        const [spiralX, spiralY] = spiralPts[m];
        newRect.sx = spiralX;
        newRect.sy = spiralY;
        m += 1;
      }
      updated.push(newRect);
    }
  }
  function isCollision(newRect, updated2) {
    let flag = false;
    for (let i = 0; i < updated2.length; i++) {
      const oldRect = updated2[i];
      flag = isColliding(newRect, oldRect);
      if (flag) break;
    }
    return flag;
  }
}
const circleColor = {
  北京市: "red",
  上海市: "green",
  海南省: "blue",
  青海省: "black",
  陕西省: "purple",
  湖北省: "blue",
  黑龙江省: "#e41a1c",
  广州省: "#377eb8",
  四川省: "#4daf4a",
  江苏省: "#984ea3"
};
function initializeTags(svg, sortedSIData, fontCfg, colorScheme, direction, spiralCfg, isShow, mode) {
  d3.select(".main-group").remove();
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
function _drawEle(svg, sortedSIData, mainG, rectG, circleG, fontCfg, colorScheme, direction, spiralCfg, isShow, centerCount = "single", mode) {
  const svgW = svg.node().clientWidth, svgH = svg.node().clientHeight;
  const projection = createProjection(
    [svgW, svgH],
    [
      [73, 122],
      [18, 52]
    ]
  );
  const allTargets = sortedSIData.map((D) => D.filter((_, i) => i !== 0)).flat();
  const globalFSScale = d3.scaleLinear().domain(d3.extent(allTargets, (d) => d[direction])).range(fontCfg.fontSizeRange);
  for (let i = 0; i < sortedSIData.length; ++i) {
    const textGroupName = sortedSIData[i][0].groupClass;
    const textGroup = mainG.append("g").attr("class", `${textGroupName}-${i}`);
    sortedSIData[i].forEach((d) => {
      const projectionPosition = projection(d.crd);
      d.x = projectionPosition[0], d.sx = projectionPosition[0];
      d.y = projectionPosition[1], d.sy = projectionPosition[1];
    });
    const fontScale = d3.scaleLinear().domain(
      d3.extent(
        sortedSIData[i].filter((_, i2) => i2 !== 0),
        (d) => d[direction]
      )
    ).range(fontCfg.fontSizeRange);
    const texts = textGroup.selectAll(`.text-${i}`).data(sortedSIData[i]).join("text").attr("class", (d) => `${d.groupClass}-${i} ${d.nameClass} text-${i}`).classed("center", (_, i2) => i2 === 0 ? true : false).attr("font-size", (d, _i) => {
      if (mode === "D2") {
        if (_i === 0) {
          return fontCfg.fontSizeRange[1];
        } else {
          if (i === 0) {
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
      if (_i === 0) {
        return fontCfg.fontSizeRange[1];
      } else {
        if (fontCfg.fontSizeScale === "local") return fontScale(d[direction]);
        return globalFSScale(d[direction]);
      }
    }).attr("font-family", fontCfg.fontFamily).attr("font-weight", fontCfg.fontWeight).attr("font-style", fontCfg.fontStyle).attr("text-anchor", "middle").attr("dominant-baseline", "middle").attr("x", (d) => d.x).attr("y", (d) => d.y).attr("fill", (d) => {
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
    }).text((d) => d.name);
    let sumArea = 0;
    for (let j = 0; j < texts.nodes().length; ++j) {
      const textEle = texts.nodes()[j];
      const { width, height } = textEle.getBBox();
      sumArea += width * height;
      sortedSIData[i][j].BBox = {
        width,
        height
      };
    }
    const maxR = Math.sqrt(sumArea);
    const spiralFn = archimedeanSpiral(spiralCfg);
    const spiralPts = genArcPts(maxR, spiralFn, [
      // 螺线点数组
      sortedSIData[i][0].x,
      sortedSIData[i][0].y
    ]);
    if (mode !== "D2") {
      updatePosition(sortedSIData[i], spiralPts);
    } else {
      if (i === 0) {
        updatePosition(sortedSIData[i], spiralPts);
      } else {
        sortedSIData[i].forEach((d, idx) => {
          d.sx = sortedSIData[0][idx].sx;
          d.sy = sortedSIData[0][idx].sy;
        });
      }
    }
    let centerX = sortedSIData[i][0].sx, centerY = sortedSIData[i][0].y, circleR = 0;
    sortedSIData[i].forEach((e) => {
      const cx = e.sx, cy = e.sy;
      const { width: w, height: h } = e.BBox;
      const vertice = [
        [cx - w / 2, cy - h / 2],
        [cx + w / 2, cy - h / 2],
        [cx + w / 2, cy + h / 2],
        [cx - w / 2, cy - h / 2]
      ];
      let r = 0;
      vertice.forEach((v) => {
        const _r = Math.sqrt((centerX - v[0]) ** 2 + (centerY - v[1]) ** 2);
        if (_r > r) r = _r;
      });
      if (r > circleR) circleR = r;
    });
    sortedSIData[i][0].r = circleR;
    const provinceName = sortedSIData[i][0].province;
    const rects = rectG.selectAll(`.rect-${i}`).data(sortedSIData[i]).join("rect").attr(
      "class",
      (d) => `${sortedSIData[i][0].groupClass}-${i}-rects ${d.nameClass} rects rect-${i}`
    ).classed("center", (_, i2) => i2 === 0 ? true : false).attr("x", (d) => d.x - d.BBox.width / 2).attr("y", (d) => d.y - d.BBox.height / 2).attr("width", (d) => d.BBox.width).attr("height", (d) => d.BBox.height).attr("fill", "none").attr("stroke", isShow.rect ? "gray" : "transprent");
    if (centerCount === "single") {
      let tickFn = function() {
        var _a;
        texts.attr("x", (d) => d.x).attr("y", (d) => d.y);
        rects.attr("x", (d) => d.x - d.BBox.width / 2).attr("y", (d) => d.y - d.BBox.height / 2);
        circle.attr("cx", sortedSIData[i][0].x).attr("cy", sortedSIData[i][0].y);
        circle.datum().x = sortedSIData[i][0].x;
        circle.datum().y = sortedSIData[i][0].y;
        (_a = d3.selectAll(".arrows")) == null ? void 0 : _a.attr(
          "transform",
          (d) => `translate(${d.x}, ${d.y})`
        );
      };
      const circle = circleG.append("circle").datum({
        name: sortedSIData[i][0].name,
        province: sortedSIData[i][0].province,
        class: `${sortedSIData[i][0].groupClass}-${i}`,
        x: sortedSIData[i][0].x,
        y: sortedSIData[i][0].y,
        r: circleR,
        direction
      }).attr("class", `${sortedSIData[i][0].groupClass}-${i}-circle circles`).attr("cx", (d) => d.x).attr("cy", (d) => d.y).attr("r", circleR).attr("fill", "none").attr("stroke-dasharray", "5 5").attr(
        "stroke",
        isShow.circle ? circleColor[provinceName] ?? "gray" : "transprent"
      );
      d3.forceSimulation(sortedSIData[i]).force(
        "x",
        d3.forceX((d) => d.sx)
      ).force(
        "y",
        d3.forceY((d) => d.sy)
      ).force("center", d3.forceCenter(svgW / 2, svgH / 2)).on("tick", tickFn).on("end", () => {
        console.log("force simulation end");
      });
    }
  }
  if (centerCount === "multi" || centerCount === "dobule") {
    let getDir = function(idx) {
      if (mode === "D2" && idx === 0) {
        return "inValue";
      } else if (mode === "D2" && idx === 1) {
        return "outValue";
      }
      return direction;
    }, ciclesTick = function() {
      var _a;
      circleEles.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      (_a = d3.selectAll(".arrows")) == null ? void 0 : _a.attr(
        "transform",
        (d) => `translate(${d.x}, ${d.y})`
      );
    };
    const circles = [];
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
        direction: getDir(i)
      });
    }
    const circleEles = circleG.selectAll("circle").data(circles).join("circle").attr("class", (d, i) => `${d.name}-${i}-circle circles`).attr("cx", (d) => d.x).attr("cy", (d) => d.y).attr("r", (d) => d.r).attr("fill", "none").attr("stroke-dasharray", "5 5").attr(
      "stroke",
      (d) => isShow.circle ? circleColor[d.province] ?? "gray" : "transprent"
    );
    d3.forceSimulation(circles).force(
      "cluster",
      centerCount === "dobule" ? null : forceCluster().strength(1)
    ).force("charge", d3.forceManyBody().strength(500)).force(
      "collision",
      d3.forceCollide().radius((d) => d.r).strength(0.8)
    ).force("center", d3.forceCenter(svgW / 2, svgH / 2)).on("tick", ciclesTick).on("end", () => {
      console.log("force simulation end");
      circles.forEach((c, i) => {
        const dx = c.x - c.sx, dy = c.y - c.sy;
        sortedSIData[i].forEach((tag) => {
          tag.sx += dx, tag.sy += dy;
          tag.x = tag.sx, tag.y = tag.sy;
        });
      });
      d3.selectAll("text").transition().duration(500).attr("x", (d) => d.x).attr("y", (d) => d.y);
      d3.selectAll("rect").transition().duration(500).attr("x", (d) => d.x - d.BBox.width / 2).attr("y", (d) => d.y - d.BBox.height / 2);
    });
  }
}
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
  force.initialize = (_) => nodes = _;
  force.strength = function(_) {
    return arguments.length ? (strength = +_, force) : strength;
  };
  return force;
}
function setInteraction(svg, colorScheme) {
  const mainG = svg.select("g.main-group");
  mainG.selectAll("circle").attr("stroke-width", 2);
  const zoom = d3.zoom().on("zoom", zoomed);
  svg.call(zoom);
  function zoomed(e) {
    const { k, x, y } = e.transform;
    mainG.style("transform", `translate(${x}px, ${y}px) scale(${k})`);
  }
  const drag = d3.drag().on("start", function(e, d) {
    const textName = this.classList[0];
    d3.selectAll(`text.${textName}`).attr("fill-opacity", 0.5);
    d3.selectAll(`circle.${textName}-circle`).attr("stroke-opacity", 0.5);
    d3.selectAll(`rect.${textName}-rects`).attr("stroke-opacity", 0.5);
  }).on("drag", function(e, d) {
    const textName = this.classList[0];
    const mx = e.x - d.x, my = e.y - d.y;
    d3.selectAll(`text.${textName}`).attr("x", (d2) => d2.x + mx).attr("y", (d2) => d2.y + my);
    d3.selectAll(`circle.${textName}-circle`).attr("cx", (d2) => d2.x + mx).attr("cy", (d2) => d2.y + my);
    d3.selectAll(`rect.${textName}-rects`).attr("x", (d2) => d2.x + mx - d2.BBox.width / 2).attr("y", (d2) => d2.y + my - d2.BBox.height / 2);
    d3.selectAll(`path.${textName}-arrow`).attr(
      "transform",
      (d2) => `translate(${d2.x + mx}, ${d2.y + my})`
    );
  }).on("end", function(e, d) {
    const textName = this.classList[0];
    const texts = d3.selectAll(`text.${textName}`).attr("fill-opacity", 1);
    const circle = d3.selectAll(`circle.${textName}-circle`).attr("stroke-opacity", 1);
    d3.selectAll(`rect.${textName}-rects`).attr("stroke-opacity", 1);
    const mx = e.x - d.x, my = e.y - d.y;
    texts.data().forEach((t) => {
      t.x += mx, t.y += my;
    });
    circle.data().forEach((c) => {
      c.x += mx, c.y += my;
    });
  });
  const centerTags = mainG.selectAll("text.center").style("cursor", "pointer");
  centerTags.call(drag);
  const targetTags = mainG.selectAll("text:not(.center)").style("cursor", "default");
  targetTags.on("mouseover", function() {
    const tagClass = this.classList[1];
    d3.selectAll(`text.${tagClass}:not(.center)`).attr("fill", "black");
    d3.selectAll(`rect.${tagClass}:not(.center)`).attr("fill", (d) => {
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
    }).attr("ry", (d) => d.BBox.height * 0.2);
  }).on("mouseleave", function() {
    const tagClass = this.classList[1];
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
    d3.selectAll(`rect.${tagClass}:not(.center)`).attr("fill", "none").attr("ry", 0);
  });
}
const outArrow = {
  // size 默认为64
  draw(context, size) {
    let r = size / 49;
    const points = [
      [2.5 * r, 0],
      [1.5 * r, -r],
      [2 * r, -1.5 * r],
      [3.5 * r, 0],
      [2 * r, 1.5 * r],
      [1.5 * r, r]
    ];
    const right = [
      [...points],
      [...scaleAfterMove(points, 2 * r, 1.5)],
      [...scaleAfterMove(points, 4 * r, 2)],
      [...scaleAfterMove(points, 6 * r, 2.5)]
    ];
    for (let i = 0; i < right.length; ++i) {
      const arrow = right[i];
      drawArrow$1(context, arrow);
    }
    const down = right.map((pts) => rotatePoints(pts, 90));
    for (let i = 0; i < down.length; ++i) {
      const arrow = down[i];
      drawArrow$1(context, arrow);
    }
    const left = down.map((pts) => rotatePoints(pts, 90));
    for (let i = 0; i < left.length; ++i) {
      const arrow = left[i];
      drawArrow$1(context, arrow);
    }
    const top = left.map((pts) => rotatePoints(pts, 90));
    for (let i = 0; i < top.length; ++i) {
      const arrow = top[i];
      drawArrow$1(context, arrow);
    }
  }
};
const inArrow = {
  // size 默认为64
  draw(context, size) {
    let r = size / 49;
    const points = [
      [2.5 * r, 0],
      [1.5 * r, -r],
      [2 * r, -1.5 * r],
      [3.5 * r, 0],
      [2 * r, 1.5 * r],
      [1.5 * r, r]
    ];
    const right = [
      [...points],
      [...scaleAfterMove(points, 2 * r, 1.5)],
      [...scaleAfterMove(points, 4 * r, 2)],
      [...scaleAfterMove(points, 6 * r, 2.5)]
    ];
    const rightReserve = right.map((pts) => rotatePoints(pts, 180));
    const rightBase = rightReserve.map((pts) => scaleAfterMove(pts, 16.5 * r));
    for (let i = 0; i < rightBase.length; ++i) {
      const arrow = rightBase[i];
      drawArrow$1(context, arrow);
    }
    const down = rightBase.map((pts) => rotatePoints(pts, 90));
    for (let i = 0; i < down.length; ++i) {
      const arrow = down[i];
      drawArrow$1(context, arrow);
    }
    const left = down.map((pts) => rotatePoints(pts, 90));
    for (let i = 0; i < left.length; ++i) {
      const arrow = left[i];
      drawArrow$1(context, arrow);
    }
    const top = left.map((pts) => rotatePoints(pts, 90));
    for (let i = 0; i < top.length; ++i) {
      const arrow = top[i];
      drawArrow$1(context, arrow);
    }
  }
};
function drawArrow$1(context, points) {
  for (let i = 0; i < points.length; ++i) {
    if (i === 0) {
      context.moveTo(points[i][0], points[i][1]);
    } else if (i < points.length - 1) {
      context.lineTo(points[i][0], points[i][1]);
    } else {
      context.lineTo(points[i][0], points[i][1]);
      context.closePath();
    }
  }
}
function scaleAfterMove(points, move, scale = 1) {
  return points.map(([x, y]) => [
    (x + move) * Math.sqrt(scale),
    // 平移后缩放
    y * Math.sqrt(scale)
  ]);
}
function rotatePoints(points, degrees) {
  const θ = degrees * Math.PI / 180;
  return points.map(([x, y]) => [
    Math.round(100 * (x * Math.cos(θ) - y * Math.sin(θ))) / 100,
    // 可选精度处理
    Math.round(100 * (x * Math.sin(θ) + y * Math.cos(θ))) / 100
  ]);
}
function drawArrow(arrow) {
  const circleG = d3.select("g.circle-group");
  circleG.selectAll(".arrows").remove();
  const data = circleG.selectAll("circle").data();
  circleG.selectAll(".arrows").data(data).join("path").attr("d", (d) => {
    const factor = 2 * d.r / 64;
    if (d.direction === "inValue") {
      return d3.symbol(inArrow, 64 * factor)();
    } else if (d.direction === "outValue") {
      return d3.symbol(outArrow, 64 * factor)();
    }
  }).attr("class", (d) => d.class + "-arrow arrows").attr("transform", (d) => `translate(${d.x}, ${d.y})`).attr("fill", "none").attr("stroke", arrow.stroke.color).attr("stroke-opacity", arrow.stroke.opacity).attr("stroke-width", arrow.stroke.width);
}
function generateSitc(sitcObj) {
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
    arrow
  } = sitcObj;
  if (!sidata) return;
  let sortedData;
  switch (mode) {
    case "S1":
      console.log("单中心，同尺度");
      if (sidata.length !== 1) {
        console.error(
          "单中心同尺度（S1）模式需要传入一个中心地点的空间交互数据"
        );
        break;
      }
      sortedData = sortSingle1(sidata, direction);
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
  if (arrow.show && direction !== "totalValue") {
    drawArrow(arrow);
  }
  interaction && setInteraction(svgSelection, colorScheme);
}
const modes = ["S1", "S2", "D1", "D2", "M"];
const directions = ["inValue", "outValue", "totalValue"];
const fontWeights = ["normal", "bold"];
const fontStyles = ["normal", "italic"];
const fontSizeScales = ["global", "local"];
class Sitc extends Base {
  constructor(sidata) {
    super();
    super.initializeSvg(this.svgSelector);
    if (sidata) {
      if (super.validateFullStructure(sidata)) {
        this.sidata = sidata;
      } else {
        throw new Error("空间交互数据结构不正确");
      }
    } else {
      this.sidata = null;
    }
  }
  /**
   * 指定空间交互数据
   * @param {Array} _
   * @returns sitcObj
   */
  data(_) {
    if (_) {
      if (super.validateFullStructure(_)) {
        this.sidata = _;
        return this;
      } else {
        throw new Error("空间交互数据结构不正确");
      }
    } else {
      throw new Error("空间交互数据不能为空");
    }
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
    typeof _.ratio === "number" && _.ratio >= 0.5 && _.ratio <= 1.5 && (this.spiralCfg.ratio = _.ratio);
    typeof _.step === "number" && _.step >= 0.01 && _.step <= 1 && (this.spiralCfg.step = _.step);
    typeof _.b === "number" && _.b >= 0.1 && _.b <= 1.5 && (this.spiralCfg.b = _.b);
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
    Array.isArray(_.fontSizeRange) && _.fontSizeRange.length === 2 && (this.font.fontSizeRange = _.fontSizeRange);
    fontSizeScales.includes(_.fontSizeScale) && (this.font.fontSizeScale = _.fontSizeScale);
    _.fontFamily && (this.font.fontFamily = _.fontFamily);
    fontWeights.includes(_.fontWeight) && (this.font.fontWeight = _.fontWeight);
    fontStyles.includes(_.fontStyle) && (this.font.fontStyle = _.fontStyle);
    return this;
  }
  /**
   * 指定色带，需要传入一个颜色数组
   */
  setColorScheme(_) {
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
    var _a, _b, _c;
    typeof _.show === "boolean" && (this.arrow.show = _.show);
    ((_a = _.stroke) == null ? void 0 : _a["color"]) && (this.arrow.stroke["color"] = _.stroke["color"]);
    ((_b = _.stroke) == null ? void 0 : _b["opacity"]) && _.stroke["opacity"] >= 0 && _.stroke["opacity"] <= 1 && (this.arrow.stroke["opacity"] = _.stroke["opacity"]);
    ((_c = _.stroke) == null ? void 0 : _c["width"]) && typeof _.stroke["width"] === "number" && // _.stroke["width"] >= 0 &&
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
export {
  Sitc as default
};
