# jquery.xslider
## 这是一个同时支持水平、垂直显示模式的 [jQuery](http://jquery.com) 滑块插件。
它是基于 input range 的功能原型进行开发，主要用作数值的输入功能。 另外它也可以应用到如：分页设置、滚屏、轮播等需求。
 - [GitHub: https://github.com/aiv367/jquery.xslider](https://github.com/aiv367/jquery.xslider)
 - [Demo: https://aiv367.github.io/jquery.xslider/demo/](https://aiv367.github.io/jquery.xslider/demo/)
 - [Author：aiv367 (大花猫花大)](mailto:aiv367@qq.com)

## 说明
 - 实现了类似 &lt;input type=&quot;range&quot; /&gt; 功能。
 - 支持小数步长设置。
 - 实现了垂直显示方式。
 - 具有良好的平台适用性，支持鼠标、触摸屏、触摸笔操作。
 - 此插件只在 Chrome, Firefox、部分Android、Window Surface 测试通过。如果你要求IE，那么此插件不适用。
  
## 更新
 - V1.1.0 [2019/06/05]

	- fixed: 
		- 修正一些 tooltip 闪烁的 bug
		- 修改 水平、垂直显示方式设置方式
		- 修正 autoScroll = false 时，重新设置当前值会自动滚动到准确位置的问题（其实也不算是bug）

	- added:
		- 增加 enable、disable 方法
		- 参数增加 width、height、handleWidth、handleHeight、onChangeEnd 等
		- 增加了多次实例化组件时，自动返回实例对象

	- removed:
		- 移除了参数 isActive
 

 - V1.0.1 [2019/05/30]
 
	- fixed: 修正自动滚动到位置功能的一个BUG

 - V1.0.0 [2019/04/23]


## 依赖
 - [jQuery2.0+](http://jquery.com)

## 使用

```html
<script src="jquery.js"></script>
<script src="jquery.xslider.js"></script>
```

```html
<!-- xslider 的宽高尺寸是随指定容器尺寸设置的 -->
<div id="demo" style="width: 200px; height: 30px;"><div>

<script>
let xslider = $('#demo1').XSlider({
    min:0,
    max:10,
    value:5,
    onChange: function(val){
        console.log(val);
    }
});

// xslider.getValue();
// xslider.setValue(5);
// xslider.resize();
</script>
```

## 参数
```javascript
$("#demo").XSlider({
    el: '', // 设置组件实例化dom
    min: 0, // 最小值
    max: 0, // 最大值
    value: 0, // 当前值
    step: 1, // 移动步长
    width: '', // 宽度，默认自适应 el dom 容器宽度
    height: '', // 宽度，默认自适应 el dom 容器高度
    className: '', // 用户自定义样式, 内置了一个 mobile 样式
    isVertical: false, // 是否是垂直
    handleAutoSize: true, // 滑块尺寸随数据量自动变化
    handleAutoSizeMin: 10, // 滑块最小尺寸，仅在 handleAutoSize = true 时有效
    handleWidth: 10, // 滑块宽度
    handleHeight: 10, // 滑块高度
    handleWrapperSideStart: 1, // 滑块容器起始距离
    handleWrapperSideEnd: 1, // 滑块容器结束距离
    clickToChange: true, // 单击滑道改变值
    tooltip: true, // 是否显示tooltip
    tooltipOffset: 3, // tooltip 显示偏移量
    tooltipDirection: '', // tooltip 方向. top bottom left right
    //格式化输出 tooltip
    tooltipFormat(value){
        return value.toFixed(that.precision) + '/' + that.opts.max.toFixed(that.precision);
    },
    autoScroll: true, // 滑块自动滚动到准确位置
    autoScrollDelayTime: 250, // 滑块自动滚动时间(ms),仅在 autoScroll = true 时有效
    initRunOnChange: true, // 初始化时执行 onChange
    isStopEvent: false, // 是否阻止事件冒泡
    onChange(val) {}, // 值变化过程事件回调
    onChangeEnd(val){}, // 值变化结束事件回调
});
```
> 当插件实例化后，通过 $('#demo).data('xslider-instance') 能够取得到插件实例对象

## 方法

名称|参数|返回值|说明
-|-|-|-
getValue()|无|Number|得到当前的值
setValue(val)|(Number) val|无|设置值
resize()|无|无|重新计算尺寸
setOptions(opts)|(Object) opts|无|设置参数