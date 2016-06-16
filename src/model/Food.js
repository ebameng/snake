package model;

class Food {
    this.x          = 0;                // 蛇头的位置
    this.y          = 0;
    
    var _width;
    
    /**
     * @constructor 
     */
    Food( x, y, width ) {
        Super();
        this.x = x;
        this.y = y;
        _width = width;
    };
    
    /**
     * @description 渲染方法, 即在畫布上绘制当前的物件
     * @param {Object} context 畫布2d上下文
     * @param {Number} frameSpeed 幀速,与上一幀之间的时间间隔,值越小,幀速越快
     */
    render( context, frameSpeed ) {
        // 绘制食物
        context.save();
        context.translate( 0, 0 );
        
        // 实心矩形
        context.lineWidth = 0;
        context.fillStyle = 'rgba(250, 160, 54, 1)'; // 金色的
        
        context.fillRect( this.x * _width, this.y * _width, _width, _width );

        context.restore();
    };
}
