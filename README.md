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
 - V1.0.1 [2019/05/30]
	fixed: 修正自动滚动到位置功能的一个BUG

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
    min: 1, //最小值
    max: 1, //最大值
    value: 1, //值
    step: 1, //步值，基本拖拽单位
    className: '', //自定义样式，内置 mobile 移动端样式
    direction: 'horizontal', //方向设置。horizontal：水平方向|vertical：垂直方向
    handleAutoSize: true, //滑块尺寸自动计算
    handleMinSize: 15, //滑块最小尺寸，仅在 handleAutoSize = true 时有效
    clickToChange: true, //单击背景触发值的改变
    isActive: true, //是否激活功能
    autoScroll: true, //滑块自动滚动到位置
    autoScrollDelayTime: 250, //滑块自动滚动延迟时间ms
    initRunOnChange: true, //初始化时执行onChange事件
    isStopEvent: false, //是否阻止冒泡，如果和其他插件结合时会用到
    tooltip: true, //是否显示提示框
    tooltipOffset: 3, //提示框偏移量
    tooltipDirection: '', //提示框方向 top bottom left right
    tooltipFormat(value){return value;}, //设置提示框内容
    onDragChange(val, oldVal){}, //拖拽过程中事件 todo: 需要开发
    onChange(val, oldVal) {}, //拖拽结束后的事件
});
```
> 当插件实例化后，通过 $('#demo).data('xslider') 能够取得到插件实例对象

## 方法

名称|参数|返回值|说明
-|-|-|-
getValue()|无|Number|得到当前的值
setValue(val)|(Number) val|无|设置值
resize()|无|无|重新计算尺寸