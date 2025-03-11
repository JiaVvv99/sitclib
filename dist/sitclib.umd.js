!(function (t, e) {
  "object" == typeof exports && "undefined" != typeof module
    ? (module.exports = e(require("d3")))
    : "function" == typeof define && define.amd
    ? define(["d3"], e)
    : ((t = "undefined" != typeof globalThis ? globalThis : t || self).Sitc = e(
        t.d3
      ));
})(this, function (t) {
  "use strict";
  function _interopNamespaceDefault(t) {
    const e = Object.create(null, {
      [Symbol.toStringTag]: { value: "Module" },
    });
    if (t)
      for (const r in t)
        if ("default" !== r) {
          const o = Object.getOwnPropertyDescriptor(t, r);
          Object.defineProperty(
            e,
            r,
            o.get ? o : { enumerable: !0, get: () => t[r] }
          );
        }
    return (e.default = t), Object.freeze(e);
  }
  const e = _interopNamespaceDefault(t);
  class Base {
    constructor() {
      if (new.target === Base) throw new Error("抽象基类Base,不能直接实例化");
      (this.svgSelection = null),
        (this.interaction = !0),
        (this.mode = "S1"),
        (this.direction = "totalValue"),
        (this.svgSelector = "#sitc-svg"),
        (this.spiralCfg = { ratio: 1, step: 0.1, b: 1, a: 0 }),
        (this.font = {
          fontSizeRange: [16, 40],
          fontSizeScale: "global",
          fontFamily: "微软雅黑",
          fontWeight: "normal",
          fontStyle: "normal",
        }),
        (this.colorScheme = ["red", "green", "yellow", "blue"]),
        (this.isShow = { circle: !1, rect: !1 }),
        (this.arrow = {
          show: !0,
          stroke: { color: "#333", opacity: 0.8, width: 1 },
        });
    }
    initializeSvg(t) {
      try {
        this.svgSelection = e.select(t);
      } catch (r) {
        console.error("指定svg画布出错：", r);
      }
      return this.svgSelection;
    }
  }
  function sortDobule1(t, e) {
    const r = [],
      o = [];
    for (let s = 0; s < t.length; ++s)
      (t[s].source.tagClass = "center"),
        (t[s].source.groupClass = t[s].source.name),
        (t[s].source.nameClass = t[s].source.name),
        o.push(...t[s].targets);
    const a = o.reduce(
      (t, e) => (t[e.name] ? ((t[e.name] += 1), t) : ((t[e.name] = 1), t)),
      {}
    );
    for (let s = 0; s < t.length; ++s) {
      const o = [],
        n = [],
        l = [];
      t[s].targets.forEach((e) => {
        (e.groupClass = `${t[s].source.name}`),
          (e.nameClass = `${e.name}`),
          a[e.name] === t.length
            ? ((e.tagClass = "allShared"), o.push(e))
            : 1 === a[e.name]
            ? ((e.tagClass = "unique"), l.push(e))
            : ((e.tagClass = "patialShared"), n.push(e));
      }),
        _sort(o, e),
        _sort(n, e),
        _sort(l, e),
        r.push([t[s].source, ...o, ...n, ...l]);
    }
    return r;
  }
  function _sort(t, e) {
    t.sort((t, r) =>
      r[e] !== t[e] ? r[e] - t[e] : r.name.length - t.name.length
    );
  }
  function archimedeanSpiral({
    ratio: t = 1,
    step: e = 0.1,
    b: r = 0.1,
    a: o = 0,
  } = {}) {
    const a = t;
    return function (t) {
      return [a * (o + r * (t *= e)) * Math.cos(t), (o + r * t) * Math.sin(t)];
    };
  }
  function genArcPts(t, e, r = [0, 0]) {
    const o = [];
    let a,
      s = 0;
    for (; (a = e((s += 1))); ) {
      let e = a[0],
        s = a[1];
      if (Math.sqrt(e ** 2 + s ** 2) > t) break;
      o.push([e + r[0], s + r[1]]);
    }
    return o;
  }
  function isColliding(t, e) {
    const r = t.sy - t.BBox.height / 2,
      o = t.sx + t.BBox.width / 2,
      a = t.sy + t.BBox.height / 2,
      s = t.sx - t.BBox.width / 2,
      n = e.sy - e.BBox.height / 2,
      l = e.sx + e.BBox.width / 2,
      c = e.sy + e.BBox.height / 2,
      i = e.sx - e.BBox.width / 2,
      u = t.BBox.width + e.BBox.width,
      h = t.BBox.height + e.BBox.height,
      f = Math.max(Math.abs(s - l), Math.abs(i - o)),
      g = Math.max(Math.abs(r - c), Math.abs(n - a));
    return f < u && g < h;
  }
  function updatePosition(t, e) {
    const r = [],
      o = t[0];
    r.push(o);
    for (let a = 1; a < t.length; a++) {
      const o = t[a];
      if (((o.sx = e[a][0]), (o.sy = e[a][1]), isCollision(o, r))) {
        let t = a;
        for (; isCollision(o, r); ) {
          const [r, a] = e[t];
          (o.sx = r), (o.sy = a), (t += 1);
        }
        r.push(o);
      }
    }
    function isCollision(t, e) {
      let r = !1;
      for (let o = 0; o < e.length; o++) {
        if (((r = isColliding(t, e[o])), r)) break;
      }
      return r;
    }
  }
  const r = {
    北京市: "red",
    上海市: "green",
    海南省: "blue",
    青海省: "black",
    陕西省: "purple",
    湖北省: "blue",
    黑龙江省: "#e41a1c",
    广州省: "#377eb8",
    四川省: "#4daf4a",
    江苏省: "#984ea3",
  };
  function initializeTags(t, r, o, a, s, n, l, c) {
    e.select(".main-group").remove();
    const i = t.append("g").attr("class", "main-group"),
      u = i.append("g").attr("class", "rect-group"),
      h = i.append("g").attr("class", "circle-group");
    switch (c) {
      case "S1":
      case "S2":
        _drawEle(t, r, i, u, h, o, a, s, n, l);
        break;
      case "D1":
        _drawEle(t, r, i, u, h, o, a, s, n, l, "dobule");
        break;
      case "D2":
        _drawEle(t, r, i, u, h, o, a, s, n, l, "dobule", "D2");
        break;
      default:
        _drawEle(t, r, i, u, h, o, a, s, n, l, "multi");
    }
  }
  function _drawEle(t, o, a, s, n, l, c, i, u, h, f = "single", g) {
    const d = t.node().clientWidth,
      y = t.node().clientHeight,
      p =
        ((m = [d, y]),
        (x = [
          [73, 122],
          [18, 52],
        ]),
        (t) => [
          ((t[0] - x[0][0]) / (x[0][1] - x[0][0])) * m[0],
          m[1] - ((t[1] - x[1][0]) / (x[1][1] - x[1][0])) * m[1],
        ]);
    var m, x;
    const w = o.map((t) => t.filter((t, e) => 0 !== e)).flat(),
      S = e
        .scaleLinear()
        .domain(e.extent(w, (t) => t[i]))
        .range(l.fontSizeRange);
    for (let $ = 0; $ < o.length; ++$) {
      const t = o[$][0].groupClass,
        m = a.append("g").attr("class", `${t}-${$}`);
      o[$].forEach((t) => {
        const e = p(t.crd);
        (t.x = e[0]), (t.sx = e[0]), (t.y = e[1]), (t.sy = e[1]);
      });
      const x = e
          .scaleLinear()
          .domain(
            e.extent(
              o[$].filter((t, e) => 0 !== e),
              (t) => t[i]
            )
          )
          .range(l.fontSizeRange),
        w = m
          .selectAll(`.text-${$}`)
          .data(o[$])
          .join("text")
          .attr("class", (t) => `${t.groupClass}-${$} ${t.nameClass} text-${$}`)
          .classed("center", (t, e) => 0 === e)
          .attr("font-size", (t, e) =>
            "D2" === g
              ? 0 === e
                ? l.fontSizeRange[1]
                : 0 === $
                ? "local" === l.fontSizeScale
                  ? x(t.inValue)
                  : S(t.inValue)
                : "local" === l.fontSizeScale
                ? x(t.outValue)
                : S(t.outValue)
              : 0 === e
              ? l.fontSizeRange[1]
              : "local" === l.fontSizeScale
              ? x(t[i])
              : S(t[i])
          )
          .attr("font-family", l.fontFamily)
          .attr("font-weight", l.fontWeight)
          .attr("font-style", l.fontStyle)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("x", (t) => t.x)
          .attr("y", (t) => t.y)
          .attr("fill", (t) => {
            switch (t.tagClass) {
              case "center":
                return c[0];
              case "allShared":
                return c[1];
              case "patialShared":
                return c[2];
              case "unique":
                return c[3];
            }
          })
          .text((t) => t.name);
      let C = 0;
      for (let e = 0; e < w.nodes().length; ++e) {
        const t = w.nodes()[e],
          { width: r, height: a } = t.getBBox();
        (C += r * a), (o[$][e].BBox = { width: r, height: a });
      }
      const b = genArcPts(Math.sqrt(C), archimedeanSpiral(u), [
        o[$][0].x,
        o[$][0].y,
      ]);
      "D2" !== g || 0 === $
        ? updatePosition(o[$], b)
        : o[$].forEach((t, e) => {
            (t.sx = o[0][e].sx), (t.sy = o[0][e].sy);
          });
      let B = o[$][0].sx,
        A = o[$][0].y,
        k = 0;
      o[$].forEach((t) => {
        const e = t.sx,
          r = t.sy,
          { width: o, height: a } = t.BBox;
        let s = 0;
        [
          [e - o / 2, r - a / 2],
          [e + o / 2, r - a / 2],
          [e + o / 2, r + a / 2],
          [e - o / 2, r - a / 2],
        ].forEach((t) => {
          const e = Math.sqrt((B - t[0]) ** 2 + (A - t[1]) ** 2);
          e > s && (s = e);
        }),
          s > k && (k = s);
      }),
        (o[$][0].r = k);
      const v = o[$][0].province,
        M = s
          .selectAll(`.rect-${$}`)
          .data(o[$])
          .join("rect")
          .attr(
            "class",
            (t) =>
              `${o[$][0].groupClass}-${$}-rects ${t.nameClass} rects rect-${$}`
          )
          .classed("center", (t, e) => 0 === e)
          .attr("x", (t) => t.x - t.BBox.width / 2)
          .attr("y", (t) => t.y - t.BBox.height / 2)
          .attr("width", (t) => t.BBox.width)
          .attr("height", (t) => t.BBox.height)
          .attr("fill", "none")
          .attr("stroke", h.rect ? "gray" : "transprent");
      if ("single" === f) {
        let tickFn = function () {
          var r;
          w.attr("x", (t) => t.x).attr("y", (t) => t.y),
            M.attr("x", (t) => t.x - t.BBox.width / 2).attr(
              "y",
              (t) => t.y - t.BBox.height / 2
            ),
            t.attr("cx", o[$][0].x).attr("cy", o[$][0].y),
            (t.datum().x = o[$][0].x),
            (t.datum().y = o[$][0].y),
            null == (r = e.selectAll(".arrows")) ||
              r.attr("transform", (t) => `translate(${t.x}, ${t.y})`);
        };
        const t = n
          .append("circle")
          .datum({
            name: o[$][0].name,
            province: o[$][0].province,
            class: `${o[$][0].groupClass}-${$}`,
            x: o[$][0].x,
            y: o[$][0].y,
            r: k,
            direction: i,
          })
          .attr("class", `${o[$][0].groupClass}-${$}-circle circles`)
          .attr("cx", (t) => t.x)
          .attr("cy", (t) => t.y)
          .attr("r", k)
          .attr("fill", "none")
          .attr("stroke-dasharray", "5 5")
          .attr("stroke", h.circle ? r[v] ?? "gray" : "transprent");
        e.forceSimulation(o[$])
          .force(
            "x",
            e.forceX((t) => t.sx)
          )
          .force(
            "y",
            e.forceY((t) => t.sy)
          )
          .force("center", e.forceCenter(d / 2, y / 2))
          .on("tick", tickFn)
          .on("end", () => {
            console.log("force simulation end");
          });
      }
    }
    if ("multi" === f || "dobule" === f) {
      let getDir = function (t) {
          return "D2" === g && 0 === t
            ? "inValue"
            : "D2" === g && 1 === t
            ? "outValue"
            : i;
        },
        ciclesTick = function () {
          var t;
          a.attr("cx", (t) => t.x).attr("cy", (t) => t.y),
            null == (t = e.selectAll(".arrows")) ||
              t.attr("transform", (t) => `translate(${t.x}, ${t.y})`);
        };
      const t = [];
      for (let e = 0; e < o.length; e++)
        t.push({
          name: o[e][0].name,
          province: o[e][0].province,
          class: `${o[e][0].groupClass}-${e}`,
          sx: o[e][0].sx,
          sy: o[e][0].sy,
          x: o[e][0].x,
          y: o[e][0].y,
          r: o[e][0].r,
          direction: getDir(e),
        });
      const a = n
        .selectAll("circle")
        .data(t)
        .join("circle")
        .attr("class", (t, e) => `${t.name}-${e}-circle circles`)
        .attr("cx", (t) => t.x)
        .attr("cy", (t) => t.y)
        .attr("r", (t) => t.r)
        .attr("fill", "none")
        .attr("stroke-dasharray", "5 5")
        .attr("stroke", (t) =>
          h.circle ? r[t.province] ?? "gray" : "transprent"
        );
      e.forceSimulation(t)
        .force(
          "cluster",
          "dobule" === f
            ? null
            : (function () {
                var t = 0.8;
                let r;
                function force(o) {
                  const a = e.rollup(r, centroid, (t) => t.province),
                    s = o * t;
                  for (const t of r) {
                    const { x: e, y: r } = a.get(t.province);
                    (t.vx -= (t.x - e) * s), (t.vy -= (t.y - r) * s);
                  }
                }
                return (
                  (force.initialize = (t) => (r = t)),
                  (force.strength = function (e) {
                    return arguments.length ? ((t = +e), force) : t;
                  }),
                  force
                );
              })().strength(1)
        )
        .force("charge", e.forceManyBody().strength(500))
        .force(
          "collision",
          e
            .forceCollide()
            .radius((t) => t.r)
            .strength(0.8)
        )
        .force("center", e.forceCenter(d / 2, y / 2))
        .on("tick", ciclesTick)
        .on("end", () => {
          console.log("force simulation end"),
            t.forEach((t, e) => {
              const r = t.x - t.sx,
                a = t.y - t.sy;
              o[e].forEach((t) => {
                (t.sx += r), (t.sy += a), (t.x = t.sx), (t.y = t.sy);
              });
            }),
            e
              .selectAll("text")
              .transition()
              .duration(500)
              .attr("x", (t) => t.x)
              .attr("y", (t) => t.y),
            e
              .selectAll("rect")
              .transition()
              .duration(500)
              .attr("x", (t) => t.x - t.BBox.width / 2)
              .attr("y", (t) => t.y - t.BBox.height / 2);
        });
    }
  }
  function centroid(t) {
    let e = 0,
      r = 0,
      o = 0;
    for (const a of t) {
      let t = a.r ** 2;
      (e += a.x * t), (r += a.y * t), (o += t);
    }
    return { x: e / o, y: r / o };
  }
  const o = {
      draw(t, e) {
        let r = e / 49;
        const o = [
            [2.5 * r, 0],
            [1.5 * r, -r],
            [2 * r, -1.5 * r],
            [3.5 * r, 0],
            [2 * r, 1.5 * r],
            [1.5 * r, r],
          ],
          a = [
            [...o],
            [...scaleAfterMove(o, 2 * r, 1.5)],
            [...scaleAfterMove(o, 4 * r, 2)],
            [...scaleAfterMove(o, 6 * r, 2.5)],
          ];
        for (let c = 0; c < a.length; ++c) {
          drawArrow$1(t, a[c]);
        }
        const s = a.map((t) => rotatePoints(t, 90));
        for (let c = 0; c < s.length; ++c) {
          drawArrow$1(t, s[c]);
        }
        const n = s.map((t) => rotatePoints(t, 90));
        for (let c = 0; c < n.length; ++c) {
          drawArrow$1(t, n[c]);
        }
        const l = n.map((t) => rotatePoints(t, 90));
        for (let c = 0; c < l.length; ++c) {
          drawArrow$1(t, l[c]);
        }
      },
    },
    a = {
      draw(t, e) {
        let r = e / 49;
        const o = [
            [2.5 * r, 0],
            [1.5 * r, -r],
            [2 * r, -1.5 * r],
            [3.5 * r, 0],
            [2 * r, 1.5 * r],
            [1.5 * r, r],
          ],
          a = [
            [...o],
            [...scaleAfterMove(o, 2 * r, 1.5)],
            [...scaleAfterMove(o, 4 * r, 2)],
            [...scaleAfterMove(o, 6 * r, 2.5)],
          ]
            .map((t) => rotatePoints(t, 180))
            .map((t) => scaleAfterMove(t, 16.5 * r));
        for (let c = 0; c < a.length; ++c) {
          drawArrow$1(t, a[c]);
        }
        const s = a.map((t) => rotatePoints(t, 90));
        for (let c = 0; c < s.length; ++c) {
          drawArrow$1(t, s[c]);
        }
        const n = s.map((t) => rotatePoints(t, 90));
        for (let c = 0; c < n.length; ++c) {
          drawArrow$1(t, n[c]);
        }
        const l = n.map((t) => rotatePoints(t, 90));
        for (let c = 0; c < l.length; ++c) {
          drawArrow$1(t, l[c]);
        }
      },
    };
  function drawArrow$1(t, e) {
    for (let r = 0; r < e.length; ++r)
      0 === r
        ? t.moveTo(e[r][0], e[r][1])
        : r < e.length - 1
        ? t.lineTo(e[r][0], e[r][1])
        : (t.lineTo(e[r][0], e[r][1]), t.closePath());
  }
  function scaleAfterMove(t, e, r = 1) {
    return t.map(([t, o]) => [(t + e) * Math.sqrt(r), o * Math.sqrt(r)]);
  }
  function rotatePoints(t, e) {
    const r = (e * Math.PI) / 180;
    return t.map(([t, e]) => [
      Math.round(100 * (t * Math.cos(r) - e * Math.sin(r))) / 100,
      Math.round(100 * (t * Math.sin(r) + e * Math.cos(r))) / 100,
    ]);
  }
  function generateSitc(t) {
    const {
      sidata: r,
      svgSelection: s,
      interaction: n,
      mode: l,
      direction: c,
      spiralCfg: i,
      font: u,
      colorScheme: h,
      isShow: f,
      arrow: g,
    } = t;
    if (!r) return;
    let d;
    switch (l) {
      case "S1":
        if ((console.log("单中心，同尺度"), 1 !== r.length)) {
          console.error(
            "单中心同尺度（S1）模式需要传入一个中心地点的空间交互数据"
          );
          break;
        }
        (d = (function (t, e) {
          const r = t[0].targets;
          return (
            r.sort((t, r) =>
              r[e] !== t[e] ? r[e] - t[e] : r.name.length - t.name.length
            ),
            (t[0].source.tagClass = "center"),
            (t[0].source.groupClass = `${t[0].source.name}`),
            (t[0].source.nameClass = `${t[0].source.name}`),
            r.forEach((e) => {
              (e.tagClass = "unique"),
                (e.groupClass = `${t[0].source.name}`),
                (e.nameClass = `${e.name}`);
            }),
            [[t[0].source, ...r]]
          );
        })(r, c)),
          initializeTags(s, d, u, h, c, i, f, l);
        break;
      case "S2":
        if ((console.log("单中心，不同尺度"), 1 !== r.length)) {
          console.error(
            "单中心同尺度（S2）模式需要传入一个中心地点的空间交互数据"
          );
          break;
        }
        (d = (function (t, e) {
          const r = t[0].source;
          (r.tagClass = "center"),
            (r.groupClass = t[0].source.name),
            (r.nameClass = t[0].source.name);
          const o = t[0].targets,
            a = o.filter((t) => "1" === t.class),
            s = o.filter((t) => "2" === t.class),
            n = o.filter((t) => "3" === t.class);
          return (
            a.forEach((t) => {
              (t.tagClass = "allShared"),
                (t.groupClass = r.name),
                (t.nameClass = t.name);
            }),
            s.forEach((t) => {
              (t.tagClass = "patialShared"),
                (t.groupClass = r.name),
                (t.nameClass = t.name);
            }),
            n.forEach((t) => {
              (t.tagClass = "unique"),
                (t.groupClass = r.name),
                (t.nameClass = t.name);
            }),
            _sort(a, e),
            _sort(s, e),
            _sort(n, e),
            [[r, ...a, ...s, ...n]]
          );
        })(r, c)),
          initializeTags(s, d, u, h, c, i, f, l);
        break;
      case "D1":
        if ((console.log("双中心，同流向"), 2 !== r.length)) {
          console.error(
            "双中心同流向（D1）模式需要传入两个中心地点的空间交互数据"
          );
          break;
        }
        (d = sortDobule1(r, c)), initializeTags(s, d, u, h, c, i, f, l);
        break;
      case "D2":
        if ((console.log("双中心，不同流向"), 1 !== r.length)) {
          console.error(
            "双中心不同流向（D2）模式需要传入一个中心地点的空间交互数据"
          );
          break;
        }
        (d = (function (t) {
          const e = t[0].targets;
          _sort(e, "totalValue"),
            (t[0].source.tagClass = "center"),
            (t[0].source.groupClass = `${t[0].source.name}`),
            (t[0].source.nameClass = `${t[0].source.name}`),
            e.forEach((e) => {
              e.inValue === e.outValue
                ? (e.tagClass = "allShared")
                : e.inValue > e.outValue
                ? (e.tagClass = "patialShared")
                : (e.tagClass = "unique"),
                (e.groupClass = `${t[0].source.name}`),
                (e.nameClass = `${e.name}`);
            });
          const r = e.map((t) => {
              const e = t.crd.map((t, e) => (0 === e ? t + 1 : t));
              return { ...t, crd: e };
            }),
            o = t[0].source.crd.map((t, e) => (0 === e ? t + 5 : t)),
            a = [{ ...t[0].source, crd: o }, ...r];
          return [[t[0].source, ...e], a];
        })(r)),
          initializeTags(s, d, u, h, c, i, f, l);
        break;
      default:
        console.log("多中心"),
          (d = sortDobule1(r, c)),
          initializeTags(s, d, u, h, c, i, f, l);
    }
    g.show &&
      "totalValue" !== c &&
      (function (t) {
        const r = e.select("g.circle-group");
        r.selectAll(".arrows").remove();
        const s = r.selectAll("circle").data();
        r.selectAll(".arrows")
          .data(s)
          .join("path")
          .attr("d", (t) => {
            const r = (2 * t.r) / 64;
            return "inValue" === t.direction
              ? e.symbol(a, 64 * r)()
              : "outValue" === t.direction
              ? e.symbol(o, 64 * r)()
              : void 0;
          })
          .attr("class", (t) => t.class + "-arrow arrows")
          .attr("transform", (t) => `translate(${t.x}, ${t.y})`)
          .attr("fill", "none")
          .attr("stroke", t.stroke.color)
          .attr("stroke-opacity", t.stroke.opacity)
          .attr("stroke-width", t.stroke.width);
      })(g),
      n &&
        (function (t, r) {
          const o = t.select("g.main-group");
          o.selectAll("circle").attr("stroke-width", 2);
          const a = e.zoom().on("zoom", function (t) {
            const { k: e, x: r, y: a } = t.transform;
            o.style("transform", `translate(${r}px, ${a}px) scale(${e})`);
          });
          t.call(a);
          const s = e
            .drag()
            .on("start", function (t, r) {
              const o = this.classList[0];
              e.selectAll(`text.${o}`).attr("fill-opacity", 0.5),
                e.selectAll(`circle.${o}-circle`).attr("stroke-opacity", 0.5),
                e.selectAll(`rect.${o}-rects`).attr("stroke-opacity", 0.5);
            })
            .on("drag", function (t, r) {
              const o = this.classList[0],
                a = t.x - r.x,
                s = t.y - r.y;
              e
                .selectAll(`text.${o}`)
                .attr("x", (t) => t.x + a)
                .attr("y", (t) => t.y + s),
                e
                  .selectAll(`circle.${o}-circle`)
                  .attr("cx", (t) => t.x + a)
                  .attr("cy", (t) => t.y + s),
                e
                  .selectAll(`rect.${o}-rects`)
                  .attr("x", (t) => t.x + a - t.BBox.width / 2)
                  .attr("y", (t) => t.y + s - t.BBox.height / 2),
                e
                  .selectAll(`path.${o}-arrow`)
                  .attr(
                    "transform",
                    (t) => `translate(${t.x + a}, ${t.y + s})`
                  );
            })
            .on("end", function (t, r) {
              const o = this.classList[0],
                a = e.selectAll(`text.${o}`).attr("fill-opacity", 1),
                s = e.selectAll(`circle.${o}-circle`).attr("stroke-opacity", 1);
              e.selectAll(`rect.${o}-rects`).attr("stroke-opacity", 1);
              const n = t.x - r.x,
                l = t.y - r.y;
              a.data().forEach((t) => {
                (t.x += n), (t.y += l);
              }),
                s.data().forEach((t) => {
                  (t.x += n), (t.y += l);
                });
            });
          o.selectAll("text.center").style("cursor", "pointer").call(s),
            o
              .selectAll("text:not(.center)")
              .style("cursor", "default")
              .on("mouseover", function () {
                const t = this.classList[1];
                e.selectAll(`text.${t}:not(.center)`).attr("fill", "black"),
                  e
                    .selectAll(`rect.${t}:not(.center)`)
                    .attr("fill", (t) => {
                      switch (t.tagClass) {
                        case "center":
                          return r[0];
                        case "allShared":
                          return r[1];
                        case "patialShared":
                          return r[2];
                        case "unique":
                          return r[3];
                      }
                    })
                    .attr("ry", (t) => 0.2 * t.BBox.height);
              })
              .on("mouseleave", function () {
                const t = this.classList[1];
                e.selectAll(`text.${t}:not(.center)`).attr("fill", (t) => {
                  switch (t.tagClass) {
                    case "center":
                      return r[0];
                    case "allShared":
                      return r[1];
                    case "patialShared":
                      return r[2];
                    case "unique":
                      return r[3];
                  }
                }),
                  e
                    .selectAll(`rect.${t}:not(.center)`)
                    .attr("fill", "none")
                    .attr("ry", 0);
              });
        })(s, h);
  }
  const s = ["S1", "S2", "D1", "D2", "M"],
    n = ["inValue", "outValue", "totalValue"],
    l = ["normal", "bold"],
    c = ["normal", "italic"],
    i = ["global", "local"];
  return class Sitc extends Base {
    constructor(t) {
      super(),
        super.initializeSvg(this.svgSelector),
        (this.sidata = Array.isArray(t) ? t : null);
    }
    data(t) {
      return Array.isArray(t) && (this.sidata = t), this;
    }
    svg(t) {
      return t && super.initializeSvg(t), this;
    }
    spiral(t) {
      return (
        "number" == typeof t.ratio &&
          t.ratio >= 0.5 &&
          t.ratio <= 1.5 &&
          (this.spiralCfg.ratio = t.ratio),
        "number" == typeof t.step &&
          t.step >= 0.01 &&
          t.step <= 1 &&
          (this.spiralCfg.step = t.step),
        "number" == typeof t.b &&
          t.b >= 0.1 &&
          t.b <= 1.5 &&
          (this.spiralCfg.b = t.b),
        this
      );
    }
    setMode(t) {
      return s.includes(t) && (this.mode = t), this;
    }
    setFont(t) {
      return (
        Array.isArray(t.fontSizeRange) &&
          2 === t.fontSizeRange.length &&
          (this.font.fontSizeRange = t.fontSizeRange),
        i.includes(t.fontSizeScale) &&
          (this.font.fontSizeScale = t.fontSizeScale),
        t.fontFamily && (this.font.fontFamily = t.fontFamily),
        l.includes(t.fontWeight) && (this.font.fontWeight = t.fontWeight),
        c.includes(t.fontStyle) && (this.font.fontStyle = t.fontStyle),
        this
      );
    }
    setColorScheme(t) {
      return (
        Array.isArray(t) &&
          (t[0] && (this.colorScheme[0] = t[0]),
          t[1] && (this.colorScheme[1] = t[1]),
          t[2] && (this.colorScheme[2] = t[2]),
          t[3] && (this.colorScheme[3] = t[3])),
        this
      );
    }
    setShow(t) {
      return (
        t.circle && (this.isShow.circle = t.circle),
        t.rect && (this.isShow.rect = t.rect),
        this
      );
    }
    setDirection(t) {
      return n.includes(t) && (this.direction = t), this;
    }
    setArrow(t) {
      var e, r, o;
      return (
        "boolean" == typeof t.show && (this.arrow.show = t.show),
        (null == (e = t.stroke) ? void 0 : e.color) &&
          (this.arrow.stroke.color = t.stroke.color),
        (null == (r = t.stroke) ? void 0 : r.opacity) &&
          t.stroke.opacity >= 0 &&
          t.stroke.opacity <= 1 &&
          (this.arrow.stroke.opacity = t.stroke.opacity),
        (null == (o = t.stroke) ? void 0 : o.width) &&
          "number" == typeof t.stroke.width &&
          (this.arrow.stroke.width = t.stroke.width),
        this
      );
    }
    setInteraction(t) {
      return "boolean" == typeof t && (this.interaction = t), this;
    }
    layout() {
      return (
        setTimeout(() => {
          generateSitc(this);
        }, 0),
        this
      );
    }
  };
});
