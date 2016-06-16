// # 程序入口文件

// 异常
//window.onerror = function( errType, errFile, errLine ) {
//    logger.error( '未捕获的异常::' + errType + ', errFile:' + errFile + ', errLine:' + errLine );
//};

// 全局变量
var
game,       // 游戏主程序
logger;     // 日志管理

// 載入依賴
Import( [ 'Fan.util.Logger',
          'Fan.util.Dom',
          'MainGame' ], function() {
    
    logger = new Fan.util.Logger( 'debug' );
    logger.setLevel( 'info' );
    // logger.setConsole( '#main_wrap > ._console' );
    
    // 构建游戏场景
    game = new MainGame( {
        canvas : document.getElementById( 'j-canvas' ),
    } );
    
    // 启动
    game.start();
    
} );
