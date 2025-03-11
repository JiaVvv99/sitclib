// 流出箭头，初始大小为 39.24 * 39.24
export const outArrow = {
  // size 默认为64
  draw(context, size) {
    // console.log({ context, size });
    let r = size / 49; // 当size默认为64时, r约等于1.3,箭头的面积约为10

    // 初始箭头点位
    const points = [
      [2.5 * r, 0],
      [1.5 * r, -r],
      [2 * r, -1.5 * r],
      [3.5 * r, 0],
      [2 * r, 1.5 * r],
      [1.5 * r, r],
    ];

    // 右向四个箭头点位
    const right = [
      [...points],
      [...scaleAfterMove(points, 2 * r, 1.5)],
      [...scaleAfterMove(points, 4 * r, 2)],
      [...scaleAfterMove(points, 6 * r, 2.5)],
    ];

    for (let i = 0; i < right.length; ++i) {
      const arrow = right[i];
      drawArrow(context, arrow);
    }

    // 顺时针旋转90°得到下边四个箭头
    const down = right.map((pts) => rotatePoints(pts, 90));

    for (let i = 0; i < down.length; ++i) {
      const arrow = down[i];
      drawArrow(context, arrow);
    }

    // 顺时针旋转90°得到左边四个箭头
    const left = down.map((pts) => rotatePoints(pts, 90));

    for (let i = 0; i < left.length; ++i) {
      const arrow = left[i];
      drawArrow(context, arrow);
    }

    // 顺时针旋转90°得到上边四个箭头
    const top = left.map((pts) => rotatePoints(pts, 90));

    for (let i = 0; i < top.length; ++i) {
      const arrow = top[i];
      drawArrow(context, arrow);
    }
  },
};

// 初始大小为39.18 * 39.18
export const inArrow = {
  // size 默认为64
  draw(context, size) {
    // console.log({ context, size });
    let r = size / 49; // 当size默认为64时, r约等于1.3,箭头的面积约为10

    // 初始箭头点位
    const points = [
      [2.5 * r, 0],
      [1.5 * r, -r],
      [2 * r, -1.5 * r],
      [3.5 * r, 0],
      [2 * r, 1.5 * r],
      [1.5 * r, r],
    ];

    // 右向四个箭头点位
    const right = [
      [...points],
      [...scaleAfterMove(points, 2 * r, 1.5)],
      [...scaleAfterMove(points, 4 * r, 2)],
      [...scaleAfterMove(points, 6 * r, 2.5)],
    ];

    // 反转right的朝向
    const rightReserve = right.map((pts) => rotatePoints(pts, 180));

    // 再向右平移22 约等于 16.5 * r
    const rightBase = rightReserve.map((pts) => scaleAfterMove(pts, 16.5 * r));

    for (let i = 0; i < rightBase.length; ++i) {
      const arrow = rightBase[i];
      drawArrow(context, arrow);
    }

    // 顺时针旋转90°，得到下边四个箭头
    const down = rightBase.map((pts) => rotatePoints(pts, 90));

    for (let i = 0; i < down.length; ++i) {
      const arrow = down[i];
      drawArrow(context, arrow);
    }

    // 顺时针旋转90°，得到左边四个箭头
    const left = down.map((pts) => rotatePoints(pts, 90));

    for (let i = 0; i < left.length; ++i) {
      const arrow = left[i];
      drawArrow(context, arrow);
    }

    // 顺时针旋转90°，得到上边四个箭头
    const top = left.map((pts) => rotatePoints(pts, 90));

    for (let i = 0; i < top.length; ++i) {
      const arrow = top[i];
      drawArrow(context, arrow);
    }
  },
};

// 绘制箭头
function drawArrow(context, points) {
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

// 平移后缩放箭头
function scaleAfterMove(points, move, scale = 1) {
  return points.map(([x, y]) => [
    (x + move) * Math.sqrt(scale), // 平移后缩放
    y * Math.sqrt(scale),
  ]);
}

// 顺时针选择degrees
function rotatePoints(points, degrees) {
  const θ = (degrees * Math.PI) / 180;
  return points.map(([x, y]) => [
    Math.round(100 * (x * Math.cos(θ) - y * Math.sin(θ))) / 100, // 可选精度处理
    Math.round(100 * (x * Math.sin(θ) + y * Math.cos(θ))) / 100,
  ]);
}
