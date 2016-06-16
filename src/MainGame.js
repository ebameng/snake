import model.Background;
import model.Snake;
import model.Food;

import AnimFrame;


/**
 * 游戏主场景
 */
class MainGame {
    // 规范代码, 私有变量一律下划线开头
    
    var _background     = null,             // 背景
        _snake          = null,             // 蛇
        _food           = null,             // 蛇的食物
        _canvas         = null,             // 画布对象
        _context2d      = null,             // 2d画布上下文
        _width          = 0,                // 画布宽度
        _height         = 0,                // 画布高度
        _stepWidth      = 10,               // 最小一步的尺寸
        _timer          = null,             // 大循环的计时器
        _stopRender     = false,            // 是否停止渲染
        _animationLoop  = null,             // 渲染動畫的主循环函数
        _fps            = 0,
        _tmpFps         = 0;
    
    
    MainGame( config ) {
        Super();
        _canvas     = config.canvas;
        _context2d  = _canvas.getContext( '2d' );
        _width      = _canvas.width;
        _height     = _canvas.height;
        
        _background = new model.Background( _width, _height, _stepWidth );
        _snake      = new model.Snake( _stepWidth );
        
        // 初始化
        this.init();
    };
    
    // 初始化的部分
    init() {
        // 初始化触屏事件
        this.initTouchScreenEvent();
        
        // 初始化用户输入事件
        this.initInputScreenEvent();
        
        // 初始化键盘事件
        this.initKeyboardEvent();
        
        /* 暂不考虑
        // 移动设备监听横屏&竖屏&屏幕尺寸发生改变时刷新尺寸
        Class.on( 'window-orientationchange', function( type ) {
            _width  = _canvas.width;
            _height = _canvas.height;
        } );
        Class.on( 'window-resize', function( type ) {
            _width  = _canvas.width;
            _height = _canvas.height;
        } );
        */
        
        // 创建一个食物
        this.createFood();
    };

    // 在地图坐标中创建一个食物
    createFood() {
        var points = _snake.getTrackPoints();
        
        var maxWidth = (_width - 200) / _stepWidth;
        var maxHeight = _height / _stepWidth;
        
        var x = Math.random() * maxWidth >> 0;
        var y = Math.random() * maxHeight >> 0;
        
        _food = new model.Food( x, y, _stepWidth );
    };
    
    /**
     * 操作检测
     */
    var _isGameOver = false,
        _operationDirection = 4,        // 操作方向: 4方向, 8方向
        _keys = [ 0, 0, 0, 0, 0, 0 ],   // 按鍵記錄, 取值 number, 順序對應[ 上, 右, 下, 左, 開火, 聊天 ]
        _keyId = 1;                     // 一個递增的标识, 用以确定按键的順序
    
    chackOperation() {
        if ( _isGameOver )
            return;
        
        // step 1: 设置朝向
        var rotation;
        switch( true ) {
        case !!(_keys[ 0 ] && _keys[ 1 ]) : // 右上
            if ( _operationDirection == 8 )
                // 8方向移动
                rotation = Rotations.rightUp;
            else if ( _keys[ 0 ] > _keys[ 1 ] )
                rotation = Rotations.up;
            else
                rotation = Rotations.right;
            break;
            
        case !!(_keys[ 1 ] && _keys[ 2 ]) : // 右下
            if ( _operationDirection == 8 )
                rotation = Rotations.rightDown;
            else if ( _keys[ 1 ] > _keys[ 2 ] )
                rotation = Rotations.right;
            else
                rotation = Rotations.down;
            break;
            
        case !!(_keys[ 0 ] && _keys[ 3 ]) : // 左上
            if ( _operationDirection == 8 )
                rotation = Rotations.leftUp;
            else if ( _keys[ 0 ] > _keys[ 3 ] )
                rotation = Rotations.up;
            else
                rotation = Rotations.left;
            break;
            
        case !!(_keys[ 3 ] && _keys[ 2 ]) : // 左下
            if ( _operationDirection == 8 )
                rotation = Rotations.leftDown;
            else if ( _keys[ 3 ] > _keys[ 2 ] )
                rotation = Rotations.left;
            else
                rotation = Rotations.down;
            break;
            
        case !!(_keys[ 0 ] && _keys[ 2 ]) : // 上下
            if ( _keys[ 0 ] > _keys[ 2 ] )
                rotation = Rotations.up;
            else
                rotation = Rotations.down;
            break;
            
        case !!(_keys[ 3 ] && _keys[ 1 ]) : // 左右
            if ( _keys[ 3 ] > _keys[ 1 ] )
                rotation = Rotations.left;
            else
                rotation = Rotations.right;
            break;
            
        case !!(_keys[ 0 ]) : // 上
            rotation = Rotations.up;
            break;
        case !!(_keys[ 1 ]) : // 右
            rotation = Rotations.right;
            break;
        case !!(_keys[ 2 ]) : // 下
            rotation = Rotations.down;
            break;
        case !!(_keys[ 3 ]) : // 左
            rotation = Rotations.left;
            break;
        }
        
        // step 2: 是否发生方向改变
        if ( _keys[ 0 ] || _keys[ 1 ] || _keys[ 2 ] || _keys[ 3 ] ) {
            // 禁止反向操作
            switch ( true ) {
            case _snake.rotation == Rotations.up && rotation == Rotations.down:
            case _snake.rotation == Rotations.right && rotation == Rotations.left:
            case _snake.rotation == Rotations.down && rotation == Rotations.up:
            case _snake.rotation == Rotations.left && rotation == Rotations.right:
                console.log( '禁止反向操作' );
                break;
            default :
                _snake.rotation = rotation;
                break;
            }
        } else {
            _keyId = 1;
        }

    };
    
    // 启动
    start() {
        logger.info( '[贪吃蛇] - 启动...' );
        
        _stopRender = false;
        
        // 执行启动
        _start();
    };
    
    // 停止
    stop() {
        _stopRender = true;
    };
    
    // 渲染, frameSpeed 与上一帧的时间差
    render( frameSpeed ) {
        // 清理画布
        _context2d.clearRect( 0, 0, _width, _height );
        
        // 绘制背景
        _background.render( _context2d, frameSpeed );
        
        // 设置格子框基点
        _context2d.save();
        _context2d.translate( 200, 0 );
        
        // 绘制食物
        _food.render( _context2d, frameSpeed );
        
        // 绘制蛇
        _snake.render( _context2d, frameSpeed );
        
        // 还原
        _context2d.restore();
        
        // 碰撞检测, 游戏结束则不检测
        if ( !_isGameOver ) {
            this.checks();
        }
        
        
        // 绘制FPS
        this.renderFPS( _context2d, frameSpeed );
        
        // 绘制分数
        this.renderScore( _context2d, frameSpeed );
    };
    
    // 检测
    checks() {
        // console.log( 'checks' );
        var points = _snake.getTrackPoints();
        var headPoint = points[ points.length - 1 ];

        // 1, 食物碰撞, 头部与食物坐标重合
        if ( headPoint.x === _food.x && headPoint.y === _food.y ) {
            // 吃到食物, 成长一次
            _snake.grow();
            
            // 重新生成新的食物
            this.createFood();
        }
        
        // 2, 撞墙检测, 头部超出地图边界
        if ( headPoint.x < 0 || headPoint.x * _stepWidth >= _width - 200 || headPoint.y < 0 || headPoint.y * _stepWidth >= _height ) {
            // 撞墙嗝屁
            _snake.die();
            _isGameOver = true;
        }
        
        // 3, 撞自己检测, 头与自身其他坐标重叠
        for ( var i = 0, l = points.length - 1; i < l; i++ ) {
            var point = points[ i ];
            if ( headPoint.x === point.x && headPoint.y === point.y ) {
                // 撞自己嗝屁
                _snake.die();
                _isGameOver = true;
            }
        }
    };
    
    // 渲染FPS值
    renderFPS( context, frameSpeed ) {
        context.save();
        context.translate( 0, 0 );
        
        context.font         = '12px Arial';    // 字号&字体
        context.textAlign    = 'center';
        context.textBaseline = 'middle';
        
        // 检测字体宽度: FPS:60
        var txtFPS = 'FPS:' + _fps;
        var textWidth = context.measureText( txtFPS ).width;
        
        context.fillStyle    = 'rgba(0, 0, 0, 0.9)';    // 填充颜色样式
        context.textBaseline = 'middle';                // 设置文本的垂直对齐方式
        context.textAlign    = 'left';                  // 设置文本的水平对对齐方式
        context.fillText( txtFPS, 5, 10, textWidth );

        context.restore();
    };
    
    // 绘制分数
    renderScore( context, frameSpeed ) {
        context.save();
        context.translate( 0, 0 );
        
        context.font         = '12px Arial';    // 字号&字体
        context.textAlign    = 'center';
        context.textBaseline = 'middle';
        
        // 检测字体宽度: FPS:60
        var txtFPS = '得分:' + ((_snake.getTrackPoints().length - 3) * 10);
        var textWidth = context.measureText( txtFPS ).width;
        
        context.fillStyle    = 'rgba(0, 0, 0, 0.9)';    // 填充颜色样式
        context.textBaseline = 'middle';                // 设置文本的垂直对齐方式
        context.textAlign    = 'left';                  // 设置文本的水平对对齐方式
        context.fillText( txtFPS, 5, 30, textWidth );

        context.restore();
    };
    
    // 初始化触屏事件
    initTouchScreenEvent() {};
    // 初始化用户输入屏事件
    initInputScreenEvent() {};
    
    // 初始化键盘事件
    initKeyboardEvent() {
        // 按下
        Fan.addEvent( window, 'keydown', function( event ) {
            var keyCode = Fan.Event.getKeyCode( event );
            var isChanged = true; // 针对上下左右检测是否重复
            
            switch( keyCode ){
            case 37:  // 左
            case 65:  // A
                if ( _snake.rotation == Rotations.right ) return;
                keyCode = 37;
                isChanged = _keys[ 3 ] != _keyId;
                _keys[ 3 ] = ++_keyId;
                break;
            case 38:  // 上
            case 87:  // W
                if ( _snake.rotation == Rotations.down ) return;
                keyCode = 38;
                isChanged = _keys[ 0 ] != _keyId;
                _keys[ 0 ] = ++_keyId;
                break;
            case 39:  // 右
            case 68:  // D
                if ( _snake.rotation == Rotations.left ) return;
                keyCode = 39;
                isChanged = _keys[ 1 ] != _keyId;
                _keys[ 1 ] = ++_keyId;
                break;
            case 40:  // 下
            case 83:  // S
                if ( _snake.rotation == Rotations.up ) return;
                keyCode = 40;
                isChanged = _keys[ 2 ] != _keyId;
                _keys[ 2 ] = ++_keyId;
                break;
            case 13:  // 回车
                break;
                
            default : return;
            }
            
            Fan.Event.cancel( event );
            
            // 对应的按键加上阴影按压效果
            // $( _touchScreen ).find( '[key-code=' + keyCode + ']' ).addClass( 'j-key-touched' );
            
            isChanged && This.chackOperation();
        } );  
        
        // 抬起
        Fan.addEvent( window, 'keyup', function( event ) {
            var keyCode = Fan.Event.getKeyCode( event );
            switch( keyCode ){
            case 37:  // 左
            case 65:  // A
                keyCode = 37;
                _keys[ 3 ] = 0;
                break;
            case 38:  // 上
            case 87:  // W
                keyCode = 38;
                _keys[ 0 ] = 0;
                break;
            case 39:  // 右
            case 68:  // D
                keyCode = 39;
                _keys[ 1 ] = 0;
                break;
            case 40:  // 下
            case 83:  // S
                keyCode = 40;
                _keys[ 2 ] = 0;
                break;
            case 13:  // 回车
                _keys[ 5 ] = 1;
                break;

            default : return;
            }
            
            Fan.Event.cancel( event );
            
            // 去掉按压效果
            // $( _touchScreen ).find( '[key-code=' + keyCode + ']' ).removeClass( 'j-key-touched' );
            
            This.chackOperation();
        } );
    };
    
    // ### 执行启动 ####
    var _start = function() {
        // 取时间
        var now = Date.now || function() { return new Date().getTime(); },
            frameNow = now();
      
        // fps
        setInterval( function() {
            _fps = _tmpFps;
            _tmpFps = 0;
        }, 1000 );
        
        // 主循环
        _animationLoop = function(){
            if ( _stopRender )
                return;
            
            _tmpFps++;
            
            // 使用浏览器动画帧处理, FPS基本固定在60
            AnimFrame.nextFrame( arguments.callee );
            
            // 定时器, FPS因执行效率影响
            // setTimeout( arguments.callee, 1000 / 60 );
            
            var curr = now();
            
            // 主场景渲染方法, 并传递与上一次调用的时差
            This.render( curr - frameNow );
            
            frameNow = curr;
        };
        
        _animationLoop();
    };
}

/**
 * static
 */
(function() {
    // 方向角度枚举
    window.Rotations = {
        up        : 0   * Math.PI / 180,
        right     : 90  * Math.PI / 180,
        down      : 180 * Math.PI / 180,
        left      : 270 * Math.PI / 180,
        rightUp   : 45  * Math.PI / 180,
        rightDown : 135 * Math.PI / 180,
        leftDown  : 225 * Math.PI / 180,
        leftUp    : 315 * Math.PI / 180
    };
})();