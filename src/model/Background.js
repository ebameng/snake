/**
 * @fileOverview 地图背景
 * @author Fan
 * @version 0.1
 */
package model;

class Background {
    var _cellWidth,         // 格子的尺寸
        _width,             // 画布的宽度
        _height;            // 画布的高度
    
    /**
     * @constructor 
     */
    Background( width, height, cellWidth ) {
        Super();
        _cellWidth = cellWidth;
        _width = width;
        _height = height;
    };
    
    /**
     * @description 渲染方法, 即在畫布上绘制当前的物件
     * @param {Object} context 畫布2d上下文
     * @param {Number} frameSpeed 幀速,与上一幀之间的时间间隔,值越小,幀速越快
     */
    render( context, frameSpeed ) {
        // logger.info( 'Background render' );
        
        // 画地图格子
        context.save();
        context.translate( 200, 0 );
        
        // 绘制线条,用实心的矩形画
        context.lineWidth = 0;
        context.fillStyle = 'rgba(0, 0, 0, 1)';
        
        var lineWidth = 0.2;
        
        // 格子大小:80x80, 1/4:40x40 1/8:20x20
        for( var i = _cellWidth; i < _width; i += _cellWidth ) {
            context.fillRect( i, 0, lineWidth, _height );
        }
        for( var i = _cellWidth; i < _height; i += _cellWidth ) {
            context.fillRect( 0, i, _width, lineWidth );
        }
        
//      context.fillRect( 0, 0, _width, lineWidth );          // 上
//      context.fillRect( _width, 0, lineWidth, _height );    // 右
//      context.fillRect( 0, _height, _width, lineWidth );    // 下
        
        context.fillRect( 0, 0, 0.4, _height );         // 左
        
        // 边线
        context.translate( -200, 0 );
        context.strokeStyle = context.fillStyle;
        context.lineWidth   = 0.8;
        context.strokeRect( 0, 0, _width, _height );

        context.restore();
    };
}
