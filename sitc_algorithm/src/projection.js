/**
 * 投影函数
 * @param {Array} svgSize svg宽高 [w, h]
 * @param {Array} crdRange 经纬度范围 [[minLng, maxLng], [minLat, maxLat]]
 * @returns {Function} 投影函数
 * */ 

export default function createProjection(svgSize, crdRange){
  return (crd) => {
    const x = (crd[0] - crdRange[0][0]) / (crdRange[0][1] - crdRange[0][0]) * svgSize[0];
    const y = svgSize[1] - (crd[1] - crdRange[1][0]) / (crdRange[1][1] - crdRange[1][0]) * svgSize[1];
    return [x, y]
  }
}