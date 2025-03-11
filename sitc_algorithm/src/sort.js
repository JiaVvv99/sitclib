/**
 * 单中心同尺度排序，根据流向对应值（值相同根据名称长度降序）的大小进行降序排序
 * @param {Array} data 空间交互数据（未排序）
 * @param {String} direction 流向
 * @return {Array} 排序后的空间交互数据
 * */
export function sortSingle1(data, direction) {
  const targets = data[0].targets;
  targets.sort((a, b) => {
    if (b[direction] !== a[direction]) {
      return b[direction] - a[direction];
    } else {
      return b.name.length - a.name.length;
    }
  });

  // 添加类别信息
  data[0].source.tagClass = "center"; // center allShared patialShared unique
  data[0].source.groupClass = `${data[0].source.name}`;
  data[0].source.nameClass = `${data[0].source.name}`;

  targets.forEach((t) => {
    t.tagClass = "unique";
    t.groupClass = `${data[0].source.name}`;
    t.nameClass = `${t.name}`;
  });

  return [[data[0].source, ...targets]];
}

/**
 * 单中心，不同尺度，根据targets中的class参数分组(center, city, province, country)，再降序排序
 * @param {Array} data 空间交互数据
 * @param {String} direction 流向
 * */
export function sortedSingle2(data, direction) {
  const source = data[0].source;
  // 添加属性
  source.tagClass = "center";
  source.groupClass = data[0].source.name;
  source.nameClass = data[0].source.name;

  const targets = data[0].targets;
  // 分组
  // const city = targets.filter((d) => d.class === "city");
  // const province = targets.filter((d) => d.class === "province");
  // const country = targets.filter((d) => d.class === "country");
  const city = targets.filter((d) => d.class === "1");
  const province = targets.filter((d) => d.class === "2");
  const country = targets.filter((d) => d.class === "3");
  // 添加属性
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

  // 排序
  _sort(city, direction);
  _sort(province, direction);
  _sort(country, direction);

  return [[source, ...city, ...province, ...country]];
}

/**
 * 双中心(不同中心地点)同流向 以及多中心的排序，先分组（中心，共有，独有），再根据值降序排序
 * @param {Array} data 空间交互数据（未排序）
 * @param {String} direction 流向
 * @return {Array} 排序后的空间交互数据
 * */
export function sortDobule1(data, direction) {
  // console.log(data, direction);
  const sorted = [], // 排序后的数据
    allTargets = []; // 所有中心的targets

  for (let i = 0; i < data.length; ++i) {
    // 更新中心地点class属性
    data[i].source.tagClass = "center";
    data[i].source.groupClass = data[i].source.name;
    data[i].source.nameClass = data[i].source.name;

    allTargets.push(...data[i].targets);
  }

  // // 所有targets中城市出现次数
  const count = allTargets.reduce((pre, cur) => {
    if (!pre[cur.name]) {
      pre[cur.name] = 1;
      return pre;
    }
    pre[cur.name] += 1;
    return pre;
  }, {});
  // console.log({ count });

  // 为每个targets中的城市分组并排序
  for (let i = 0; i < data.length; ++i) {
    const allShared = [],
      patialShared = [],
      unique = [];
    const targets = data[i].targets;

    // 分组并添加属性
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

    // 对不同组别排序
    _sort(allShared, direction);
    _sort(patialShared, direction);
    _sort(unique, direction);

    // 添加到排序后的数组
    sorted.push([data[i].source, ...allShared, ...patialShared, ...unique]);
  }

  // console.log({sorted});

  return sorted;
}

/**
 *双中心，不同流向[[流入],[流出]], 根据总量进行排序,排序完第一份做为流入，然后深拷贝一份相同顺序的作为流出
 * @param {Array} data 一个中心城市的空间交互数据
 * @returns 排序后的空间交互数据，流入=流出：allshared, 流入>流出：patialShared,流入<流出：unique
 * */
export function sortDoubule2(data) {
  const targets = data[0].targets;
  // 排序targets
  _sort(targets, "totalValue");

  // 添加类别信息
  data[0].source.tagClass = "center"; // center allShared patialShared unique
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
    const _crd = D.crd.map((d, i) => (i === 0 ? d + 1 : d));
    return {
      ...D,
      crd: _crd,
    };
  });

  const _sourceCrd = data[0].source.crd.map((d, i) => (i === 0 ? d + 5 : d));
  const clone = [{ ...data[0].source, crd: _sourceCrd }, ...targetsCopy];

  // clone[0].name = "我被修改啦";
  // clone[0].crd[0] = 11111;
  // console.log({ data, clone });

  return [[data[0].source, ...targets], clone];
}

// 根据流向对应的值降序排序， 若流向值相同，根据name长度降序排序
function _sort(data, direction) {
  data.sort((a, b) => {
    if (b[direction] !== a[direction]) {
      return b[direction] - a[direction];
    } else {
      return b.name.length - a.name.length;
    }
  });
}
