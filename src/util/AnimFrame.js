/**
 * 动画帧
 */
Class( 'AnimFrame', function() {} );

/**
 * static
 */
(function() {
    var
    RAF_timeoutId   = null,
    RAF             = window.requestAnimationFrame        ||
                      window.webkitRequestAnimationFrame  ||
                      window.mozRequestAnimationFrame     ||
                      window.oRequestAnimationFrame       ||
                      window.msRequestAnimationFrame      ||
                      function ( callback ) { return RAF_timeoutId = window.setTimeout( callback, 1000 / 60 ); },
    CAF             = window.cancelAnimationFrame         ||
                      window.webkitCancelAnimationFrame   ||
                      window.mozCancelAnimationFrame      ||
                      window.oCancelAnimationFrame        ||
                      function ( timeoutId ) {
                          if ( timeoutId ) {
                              window.clearTimeout( timeoutId );
                              return;
                          }
                          RAF_timeoutId && window.clearTimeout( RAF_timeoutId );
                          RAF_timeoutId = null;
                      };
    
    // 下一帧回调
    AnimFrame.nextFrame = function( callback ) { return RAF( callback ); };
    
    // 取消动画帧回调
    AnimFrame.cancelFrame = function( timeoutId ) { CAF( timeoutId ); };
})();