/**
 * XSlide
 * @version 1.0
 * @update 2019/04/08
 */
class XSlider {

	constructor(opts) {

		let that = this;
		this.opts = $.extend(true, {
			el: '',
			min: 1,
			max: 1,
			value: 1,
			step: 1,
			className: '',				//内置移动端样式 mobile
			direction: 'horizontal',	//显示方向 horizontal | vertical
			handleAutoSize: true,		//滑块随着内容自动设置尺寸
			handleMinSize: 15,			//滑块最小尺寸，仅在 handleAutoSize = true 时有效
			clickToChange: true,		//单击背景改变range值
			isActive: true,				//是否激活功能
			tooltip: true,				//是否显示tooltip
			tooltipOffset: 3,			//数值提示框偏移量
			tooltipDirection: '',		//消息框方向 top bottom left right
			tooltipFormat(value){
				return value.toFixed(that.precision) + '/' + that.opts.max.toFixed(that.precision);
			},//格式化输出 tooltip

			autoScroll: true,			//滑块自动滚动到位置
			autoScrollDelayTime: 250,	//滚动到目标位置后延时xms后滚动到标准位置

			initRunOnChange: true,		//初始化时执行onChange事件
			isStopEvent: false,         //是否阻止冒泡，如果和其他插件结合时会用到
			onDragChange(val, oldVal){},//拖拽过程中的值变化 todo: 需要开发
			onChange(val, oldVal) {},   //拖拽结束后的值变化

		}, opts);

		if(this.opts.tooltipDirection === ''){
			this.opts.tooltipDirection = this.opts.direction === 'horizontal' ? 'top': 'right'
		}
		
		this.events = {
			start: 'touchstart mousedown',
			move: 'touchmove mousemove',
			end: 'touchend mouseup',
			over: 'mouseenter',
			out: 'mouseleave'
		};

		this.stepNums = 0;//刻度数量
		this.precision = 0;//素值精度
		this.isDrag = false;

		this.$bg = undefined;
		this.$handleWrapper = undefined;
		this.$handle = undefined;
		this.$body = $('body');
		this.$window = $(window);

		this._initElement();
		this._initEvent();
		this.setOptions(this.opts);

		//为了在初始化值时，不要动画效果
		setTimeout(()=>{
			this.$handle.attr('isdrag', 'false');
		}, 100);

	}

	_initElement() {

		this.$el = $(this.opts.el);

		this.$wrapper = $(`
			<div class="xslide">
				<div class="xslide-bg"></div>
				<div class="xslide-handle-wrapper">
					<div class="xslide-handle" isdrag="none"></div>
				</div>
			</div>
		`);

		this.$bg = this.$wrapper.find('.xslide-bg');
		this.$handleWrapper = this.$wrapper.find('.xslide-handle-wrapper');
		this.$handle = this.$wrapper.find('.xslide-handle');

		this.$el.append(this.$wrapper);
		this.$body.append(this.$tooltip);

	}

	_initEvent() {

		let that = this;

		this.$window.on('resize', function(){
			that.resize();
		});

		//handle 滑块拖拽
		this.$handle.on(this.events.start, function(evt){

			evt.preventDefault();

			if(!that.opts.isActive){
				return false;
			}

			let $this = $(this);
			let dragEvent = evt.touches ? evt.touches[0] : evt;
			let handleOffset = $this.offset();

			if(that.opts.min === that.opts.max){
				return;
			}

			//偏移数据
			let positionStart = {
				left: dragEvent.pageX - handleOffset.left,
				top: dragEvent.pageY - handleOffset.top
			};

			//设置当前位拖拽中标记
			$this.attr('isdrag', 'true');
			that.isDrag = true;

			function drawMove(evt){

				let dragEvent = evt.touches ? evt.touches[0] : evt;
				let position = {
					left: dragEvent.pageX - positionStart.left - that.$handleWrapper.offset().left,
					top: dragEvent.pageY - positionStart.top - that.$handleWrapper.offset().top
				};

				//坐标越界处理
				if(position.left < 0){
					position.left = 0;
				}else if(position.left + $this.width() > that.$handleWrapper.width()){
					position.left = that.$handleWrapper.width() - $this.width();
				}

				if(position.top < 0){
					position.top = 0;
				}else if(position.top + $this.height() > that.$handleWrapper.height()){
					position.top = that.$handleWrapper.height() - $this.height();
				}

				//设置 handle 位置
				if(that.opts.direction === 'horizontal'){
					$this.css('left', position.left);
				}else{
					$this.css('top', position.top);
				}

				//设置值
				that.setValue(that._getHandlePositionValue(position.left, position.top), false);

				//tooltip
				if(that.opts.tooltip){
					let tooltipPosition = that._getTooltipPositionForHandle();
					that._tooltip(true, tooltipPosition.left, tooltipPosition.top, that.opts.tooltipFormat(that.opts.value));
				}

			}

			function drawEnd(evt){

				$this.attr('isdrag', 'false');
				that.isDrag = false;
				that.$window.off(that.events.move, drawMove);
				that.$window.off(that.events.end, drawEnd);

				//如果鼠标不再内部，就取消tooltip显示
				if(that.opts.tooltip) {
					if (evt.touches || !$(evt.target).closest(that.$wrapper).length) {
						that._tooltip(false);
					}
				}

				//自动滚动到标准位置
				if(that.opts.autoScroll){
					if(evt.touches || !$(evt.target).closest(that.$wrapper).length){
						that._handleScrollToValuePosition();
					}
				}

			}

			that.$window.on(that.events.move, drawMove);
			that.$window.on(that.events.end, drawEnd);
			if(that.opts.isStopEvent){
				evt.preventDefault();
				evt.stopPropagation();
			}

		});

		//滑道单击
		this.$handleWrapper
			.on(this.events.start, function (evt) {

				if(!that.opts.isActive){
					return false;
				}

				let dragEvent = evt.touches ? evt.touches[0] : evt;
				let handleWrapperOffset = that.$handleWrapper.offset();
				let handlePosition = that.$handle.position();
				
				//position 相对父级坐标（相对坐标）
				let position = {
					left: dragEvent.pageX - handleWrapperOffset.left,
					top: dragEvent.pageY - handleWrapperOffset.top,
					handleLeft: dragEvent.pageX - handleWrapperOffset.left - that.$handle.width()/2,
					handleTop: dragEvent.pageY - handleWrapperOffset.top - that.$handle.height()/2,
				};

				//检测单击区域是不是在handle范围内，如果范围内，就不继续执行
				if (that.opts.direction === 'horizontal') {
					if(position.left > handlePosition.left && position.left < handlePosition.left + that.$handle.width()){
						return;
					}
				} else {
					if(position.top > handlePosition.top && position.top < handlePosition.top + that.$handle.height()){
						return;
					}
				}

				//坐标越界修正
				if(position.handleLeft < 0){
					position.handleLeft = 0;
				}else if(position.handleLeft + that.$handle.width() > that.$handleWrapper.width()){
					position.handleLeft = that.$handleWrapper.width() - that.$handle.width();
				}

				if(position.handleTop < 0){
					position.handleTop = 0;
				}else if(position.handleTop + that.$handle.height() > that.$handleWrapper.height()){
					position.handleTop = that.$handleWrapper.height() - that.$handle.height();
				}

				//根据鼠标/手指操作的点的相对坐标获得该点的value值
				let pointValue = that._getHandleWrapperPointValue(position.left, position.top);

				//设置值
				that.setValue(pointValue, false);

				if (that.opts.direction === 'horizontal') {
					that.$handle.css('left', position.handleLeft);
				} else {
					that.$handle.css('top', position.handleTop);
				}

			})
			.on(this.events.over, function (evt) {
				clearTimeout(that._timer);
			})
			.on(this.events.out, function(evt){

				//自动滚动到准确位置
				if(that.opts.autoScroll){
					if(evt.touches || !that.isDrag){
						that._handleScrollToValuePosition();
					}
				}

			});


		//tooltip(PC端专属事件)
		this.opts.tooltip && this.$handleWrapper
			.on('mousemove', function (evt) {

				let handlePosition = that.$handle.offset();

				//相对坐标
				let evtPosition = {
					left: evt.pageX - that.$handleWrapper.offset().left,
					top: evt.pageY - that.$handleWrapper.offset().top
				};

				if(that.opts.direction === 'horizontal'){


					if(evt.pageX >= handlePosition.left && evt.pageX <= handlePosition.left + that.$handle.width()){

						//handle 区域移动
						if(!that.isDrag){
							let tooltipPosition = that._getTooltipPositionForHandle();
							that._tooltip(true, tooltipPosition.left, tooltipPosition.top, that.opts.tooltipFormat(that.opts.value));
						}

					}else{

						//handle 区域外移动
						let tooltipPosition = that._getTooltipPositionForHandleWrapper(evt.pageX, evt.pageY);
						let pointValue = that._getHandleWrapperPointValue(evtPosition.left, evtPosition.top);
						that._tooltip(true, tooltipPosition.left, tooltipPosition.top, that.opts.tooltipFormat(pointValue));
					}

				}else{

					if(evt.pageY >= handlePosition.top && evt.pageY <= handlePosition.top + that.$handle.height()){

						//handle 区域移动
						if(!that.isDrag){
							let tooltipPosition = that._getTooltipPositionForHandle();
							that._tooltip(true, tooltipPosition.left, tooltipPosition.top, that.opts.tooltipFormat(that.opts.value));
						}

					}else{

						//handle 区域外移动
						let tooltipPosition = that._getTooltipPositionForHandleWrapper(evt.pageX, evt.pageY);
						let pointValue = that._getHandleWrapperPointValue(evtPosition.left, evtPosition.top);
						that._tooltip(true, tooltipPosition.left, tooltipPosition.top, that.opts.tooltipFormat(pointValue));
					}

				}

			})
			.on('mouseleave', function (evt) {
				if(!that.isDrag ){//&& evt.relatedTarget !== that.$tooltip[0]
					that._tooltip(false);
				}
			});

	}

	setOptions(opts){
		
		this.opts = $.extend(true, this.opts, opts);
		
		//设置水平，垂直布局样式（标识）
		opts.direction && this.$wrapper.removeClass('horizontal vertical').addClass(opts.direction);

		//自定义样式
		opts.className && this.$wrapper.removeClass(this.opts.className).addClass(opts.className);

		//重新设置 handle 的尺寸
		if(this.opts.handleAutoSize){
			this._resetHandleSize();
		}else{
			this.opts.min == this.opts.max ? this.$handle.css('visibility','hidden') : this.$handle.css('visibility','');
		}

		//重新计算刻度数量
		// if(opts.min !== undefined || opts.max !== undefined || opts.step !== undefined){
		this.stepNums = (this.opts.max - this.opts.min) / this.opts.step; //刻度数
		// }
		
		if(opts.value !== undefined){
			this.setValue(opts.value);
		}

		//计算小数位长度
		if(opts.min !== undefined || opts.max !== undefined || opts.step !== undefined){

			let precision = this.precision;//默认精度 0 小数位

			if(opts.min !== undefined){
				let tmp = this.opts.min.toString().split('.');
				let _precision = tmp[1] ? tmp[1].length : 0;
				if(_precision> precision){
					precision = _precision;
				}
			}

			if(opts.max !== undefined){
				let tmp = this.opts.max.toString().split('.');
				let _precision = tmp[1] ? tmp[1].length : 0;
				if(_precision> precision){
					precision = _precision;
				}
			}

			if(opts.step !== undefined){
				let tmp = this.opts.step.toString().split('.');
				let _precision = tmp[1] ? tmp[1].length : 0;
				if(_precision> precision){
					precision = _precision;
				}
			}

			this.precision  = precision;

		}

	}

	setValue(value, toScroll = true){

		//越界检测
		if(value < this.opts.min || value > this.opts.max){
			return;
		}

		if(value !== this.opts.value){
			this.opts.onChange(value, this.opts.value);
		}

		this.opts.value = value;
		!this.isDrag && toScroll && this._setHandlePositionByValue(value);

	}

	getValue(){
		return this.opts.value;
	}

	resize(){
		this._resetHandleSize();
		this._setHandlePositionByValue(this.opts.value);
	}
	deactive(){
		this.$handle.css({'transition': 'none'});
		this.opts.isActive = false;

	}
	active(){

		this.$handle.css({'transition': 'transform $xslide-animate-speed linear, all $xslide-animate-speed linear;'});
		this.opts.isActive = true;

	}
	/**
	 * 重新计算handle尺寸
	 * @DateTime    2018/12/20 9:30
	 * @Author      wangbing
	*/
	_resetHandleSize(){

		let handleSize;

		if(this.opts.handleAutoSize){

			this.$handle.one('webkitTransitionEnd transitionend', evt => {
			    this._setHandlePositionByValue(this.opts.value);
			});

			if(this.opts.direction === 'horizontal'){
				handleSize = this.$wrapper.width() / ((this.opts.max - this.opts.min) / this.opts.step + 1);
			}else{
				handleSize = this.$wrapper.height() / ((this.opts.max - this.opts.min) / this.opts.step + 1);
			}

			if(handleSize < this.opts.handleMinSize){
				handleSize = this.opts.handleMinSize;
			}

			this.opts.direction == 'horizontal' ? this.$handle.width(handleSize) : this.$handle.height(handleSize);

		}else{

			this.opts.direction == 'horizontal' ? this.$handle.width() : this.$handle.height();

		}

	}

	_value(value){
		return Number(value.toFixed(this.precision));
	}
	
	/**
	 * 显示tooltip
	 * @DateTime    2018/12/26 15:23
	 * @Author      wangbing
	 * @param       {Boolean}   isShow	显示/隐藏
	 * @param		{Number}	left	水平坐标
	 * @param		{Number}	top		垂直坐标
	 * @param		{String}	text	内容
	*/
	_tooltip(isShow, pageX = 0, pageY = 0, text = ""){
		if(isShow){

			if(!this.$tooltip){
				this.$tooltip = $('<div class="xslide-tooltip '+this.opts.tooltipDirection+'">' + text + '</div>');
				this.$body.append(this.$tooltip);
			}

			this.$tooltip.html(text).css({left: pageX, top: pageY}).show();

		}else{

			if(this.$tooltip){
				this.$tooltip.hide();
			}

		}
	}

	/**
	 * 得到handle位置的value值
	 * @DateTime    2018/12/20 15:59
	 * @Author      wangbing
	 * @param       {Number}    positionLeft  水平相对坐标
	 * @param       {Number}    positionTop  垂直坐标
	 * @return      {Number}    实际值
	 */
	_getHandlePositionValue(positionLeft, positionTop){

		let value;
		let stepPix; //每一个刻度的像素尺寸

		if (this.opts.direction === 'horizontal') {
			stepPix = (this.$handleWrapper.width() - this.$handle.width()) / this.stepNums;
			value = parseInt((positionLeft + stepPix/2) / stepPix) * this.opts.step + parseFloat(this.opts.min);
		} else {
			stepPix = (this.$handleWrapper.height() - this.$handle.height()) / this.stepNums;
			value = parseInt((positionTop + stepPix/2) / stepPix) * this.opts.step + parseFloat(this.opts.min);
		}

		return this._value(value);

	}

	/**
	 * 得到handleWrapper 对应点的 value
	 * @DateTime    2018/12/21 13:48
	 * @Author      wangbing
	 * @param       {Number}    positionLeft  水平相对坐标
	 * @param       {Number}    positionTop  垂直相对坐标
	 * @return      {Number}    实际值
	 */
	_getHandleWrapperPointValue(positionLeft, positionTop){

		let value;
		let stepPix; //每一个刻度的像素尺寸

		if (this.opts.direction === 'horizontal') {
			
			if(this.stepNums){
				stepPix = this.$handleWrapper.width() / this.stepNums;
				value = parseInt((positionLeft + stepPix/2) / stepPix) * this.opts.step + parseFloat(this.opts.min);
			}else{
				value = this.opts.min;
			}

		} else {

			if(this.stepNums){
				stepPix = this.$handleWrapper.height() / this.stepNums;
				value = parseInt((positionTop + stepPix/2) / stepPix) * this.opts.step + parseFloat(this.opts.min);
			}else{
				value = this.opts.min;
			}

		}

		return this._value(value);

	}

	/**
	 * 根据value值设置handle的位置
	 * @DateTime    2018/12/21 14:13
	 * @Author      wangbing
	 * @param       {Number}    value	实际值
	 */
	_setHandlePositionByValue(value){

		// if(!this.stepNums){
		// 	return;
		// }
		let stepPix; //每一个刻度的像素尺寸
		
		if (this.opts.direction === 'horizontal') {
			
			if(this.stepNums){
				stepPix = (this.$handleWrapper.width() - this.$handle.width()) / this.stepNums;
				this.$handle.css('left', ((value - this.opts.min) / this.opts.step) * stepPix);
			}else{
				this.$handle.css('left', 0);
			}


		} else {

			if(this.stepNums){
				stepPix = (this.$handleWrapper.height() - this.$handle.height()) / this.stepNums;
				this.$handle.css('top', ((value - this.opts.min) / this.opts.step) * stepPix);
			}else{
				this.$handle.css('top', 0);
			}

		}

	}

	_getTooltipPositionForHandle(){

		let position;

		let handleOffset = this.$handle.offset();

		switch (this.opts.tooltipDirection) {
			case 'top':
				position = {
					left: handleOffset.left + this.$handle.width() / 2,
					top: handleOffset.top - this.opts.tooltipOffset
				};
				break;

			case 'bottom':
				position = {
					left: handleOffset.left + this.$handle.width() / 2,
					top: handleOffset.top + this.$handle.height() + this.opts.tooltipOffset
				};
				break;
			case 'left':
				position = {
					left: handleOffset.left - this.opts.tooltipOffset,
					top: handleOffset.top + this.$handle.height()/2
				};
				break;
			case 'right':
				position = {
					left: handleOffset.left + this.$handle.width() + this.opts.tooltipOffset,
					top: handleOffset.top + this.$handle.height()/2
				};
				break;
		}
		return position;
	}

	_getTooltipPositionForHandleWrapper(left, top){

		let position;
		let handleOffset = this.$handle.offset();

		switch (this.opts.tooltipDirection) {
			case 'top':
				position = {
					left: left,
					top: handleOffset.top - this.opts.tooltipOffset
				};
				break;

			case 'bottom':
				position = {
					left: left,
					top: handleOffset.top + this.$handle.height() + this.opts.tooltipOffset
				};
				break;
			case 'left':
				position = {
					left: handleOffset.left - this.opts.tooltipOffset,
					top: top
				};
				break;
			case 'right':
				position = {
					left: handleOffset.left + this.$handle.width() + this.opts.tooltipOffset,
					top: top
				};
				break;
		}

		return position;
	}

	/**
	 * handle 滚动到精确位置
	 * @DateTime    2018/12/28 11:11
	 * @Author      wangbing
	*/
	_handleScrollToValuePosition() {

		clearTimeout(this._timer);
		this._timer = setTimeout(() => {
			this._setHandlePositionByValue(this.opts.value);
		}, this.opts.autoScrollDelayTime);

	}

}

(function($){

	$.fn.XSlider = function (opts) {

		let $this = $(this);
	
		if ($this.length > 1) {
			$this.each((index, el) => {
				$this.XSlide(opts);
			});
	
		} else {
			opts.el = $this;
			return new XSlider(opts);
	
		}
	};
	
})(window.jQuery);