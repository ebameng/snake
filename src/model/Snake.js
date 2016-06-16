package model;

class Snake {
    this.length     = 3;                // 蛇的长度
    this.rotation   = Rotations.right;  // 蛇头的朝向: Rotations封装方向
    this.speed      = 100;              // 移动速度,移动1格是耗时,单位毫秒
    this.isMoving   = true;             // 是否在移动中
    
    // 蛇身轨迹坐标点, 顺序: [ 尾, 身, 头 ]
    var _track      = [ { x : 0, y : 0 }, { x : 1, y : 0 }, { x : 2, y : 0 } ];
    var _snakeWidth;                     // 蛇身宽度
    
    var _stepX = 0;
    var _stepY = 0;
    
    /**
     * @constructor 
     */
    Snake( snakeWidth ) {
        Super();
        _snakeWidth = snakeWidth;
    };
    
    // 获取蛇身轨迹的一个复本
    getTrackPoints() {
        return [].concat( _track );
    };
    
    /**
     * 成长一次
     */
    grow() {
        // 蛇身增长一节, 从尾巴增长
        var last = _track[ 0 ];
        var newLast = { x : last.x, y : last.y };
        
        _track = [ newLast ].concat( _track );
        
        // 移动速度加快
        this.speed *= 0.9;
    };
    
    // 检测相邻的轨迹是否是连续的
    checkTrackLink( point1, point2 ) {
        return (point1.x === point2.x && (point1.y === point2.y + 1) || (point1.y === point2.y - 1))
                || (point1.y === point2.y && ((point1.x === point2.x + 1) || (point1.x === point2.x - 1)));
    };
    
    // 检测轨迹是否重叠
    checkCover( point1, point2 ) {
        return point1.x === point2.x && point1.y === point2.y;
    };
    
    // 嗝屁
    die() {
        this.isMoving = false;
        logger.info( '蛇嗝屁了....!' );
    };
    
    /**
     * @description 渲染方法, 即在畫布上绘制当前的物件
     * @param {Object} context 畫布2d上下文
     * @param {Number} frameSpeed 幀速,与上一幀之间的时间间隔,值越小,幀速越快
     */
    render( context, frameSpeed ) {
        if ( this.isMoving ) {
            // 当前帧移动的距离
            var step = 1 * frameSpeed / this.speed;
            
            // 根据方向,时差,计算本帧需要移动的距离,因为是跳格,所以需要累计小数部分
            switch ( this.rotation ) {
            case Rotations.up :
                _stepY += -step;
                _stepX = 0;
                break;
            case Rotations.right :
                _stepX += step;
                _stepY = 0;
                break;
            case Rotations.down :
                _stepY += step;
                _stepX = 0;
                break;
            case Rotations.left :
                _stepX += -step;
                _stepY = 0;
                break;
            }
        } else {
            _stepX = 0;
            _stepY = 0;
        }
        
        // 原本头部位置
        var headPoint = _track[ _track.length - 1 ];
        
        // 新的头部位置
        var newHeadPoint = {
                x : headPoint.x + (_stepX >> 0), // 向下取整
                y : headPoint.y + (_stepY >> 0)
        };
        
        // 检测头部是否重叠
        var hasMove = !this.checkCover( newHeadPoint, headPoint );
        
        // 若具备移动的条件, 则追加一个新的头部位置, 删去最后一节尾部
        if ( hasMove ) {
            // logger.error( 'hasMove' );
            _track.shift();
            _track.push( newHeadPoint );
            _stepY = _stepY % 1;
            _stepX = _stepX % 1;
        }
        
        // 绘制蛇
        context.save();
        context.translate( 0, 0 );
        
        // 实心矩形
        context.lineWidth = 0;
        context.fillStyle = 'rgba(55, 55, 55, 0.5)';
        
        var lineWidth = 0.2;
        
        // 绘制蛇身轨迹
        for ( var i = 0, l = _track.length - 1; i < l; i++ ) {
            var point = _track[ i ];
            context.fillRect( point.x * _snakeWidth, point.y * _snakeWidth, _snakeWidth, _snakeWidth );
        }
        
        // 绘制蛇头(金色的, 嗝屁后的蛇头是红色)
        context.fillStyle = this.isMoving ? 'rgba(250, 0, 0, 1)' : 'rgba(0, 0, 0, 1)';
        
        context.fillRect( newHeadPoint.x * _snakeWidth, newHeadPoint.y * _snakeWidth, _snakeWidth, _snakeWidth );

        context.restore();
    };
}
