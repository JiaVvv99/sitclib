/**
 * 对标签文本的外接矩形进行碰撞检测
 * @param {*} rect1
 * @param {*} rect2
 * */ 
function isColliding(rect1,rect2){
    // rect1的上右下左边
    const t1 = rect1.sy - rect1.BBox.height / 2, 
    r1 = rect1.sx + rect1.BBox.width / 2,  
    b1 = rect1.sy + rect1.BBox.height / 2, 
    l1 = rect1.sx - rect1.BBox.width / 2; 

    // rect2的上右下左边
    const t2 = rect2.sy - rect2.BBox.height / 2,
            r2 = rect2.sx + rect2.BBox.width / 2,  
            b2 = rect2.sy + rect2.BBox.height / 2, 
            l2 = rect2.sx - rect2.BBox.width / 2; 

    // rect1 2的宽高和
    const w12 = rect1.BBox.width + rect2.BBox.width,
            h12 = rect1.BBox.height + rect2.BBox.height;

    // rect1 2上下边 左右边的间距
    const wMax = Math.max(Math.abs(l1 - r2), Math.abs(l2 - r1));
    const hMax = Math.max(Math.abs(t1 - b2), Math.abs(t2 - b1));

    if(wMax < w12 && hMax < h12){
        return true;
    }

    return false;
}

/**
 * 更新标签文本外接矩形在阿基米德螺线上的位置
 * @param {Array} textRects 标签文本外接矩形列表
 * @param {Array} spiralPts 阿基米德螺线点，以（0，0）为起点
 * */ 
export default function updatePosition(textRects, spiralPts){
    // 已经确定好位置的矩形
    const updated = [];
    // textRects中第一个矩形
    const first = textRects[0];
    // 第一个矩形的坐标
    // const firstX = first.x, firstY = first.y;
    updated.push(first);

    // 挨个确定外接矩形的位置（从第二个开始）
    for(let i = 1; i < textRects.length; i++){
        // 要确定位置的矩形
        const newRect = textRects[i];
        newRect.sx = spiralPts[i][0];
        newRect.sy = spiralPts[i][1];
        
        // 判断newRect是否和updated里面的矩形碰撞
        if(isCollision(newRect, updated)){

            // newRect与updated中的矩形存在碰撞，根据螺线点更新newRect的位置
            let m = i;
            while(isCollision(newRect, updated)){
                // 螺线点坐标
                const [spiralX, spiralY] = spiralPts[m];

                // 更新newRect位置
                newRect.sx = spiralX;
                newRect.sy = spiralY;

                m += 1;
            }

            updated.push(newRect);
        }
    }

    // 判断要摆放矩形是否位于无重叠位置
    function isCollision(newRect,updated){
        let flag = false;
        // 判断newRect是否和updated里面的矩形碰撞
        for(let i = 0; i < updated.length; i++){
            const oldRect = updated[i];
            flag = isColliding(newRect, oldRect);
            if(flag) break;
        }
        return flag;
    }

}
