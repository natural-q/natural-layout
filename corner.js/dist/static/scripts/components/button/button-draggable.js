"use strict";var timeOut,_createClass=function(){function e(e,t){for(var n=0;n<t.length;n++){var s=t[n];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(e,s.key,s)}}return function(t,n,s){return n&&e(t.prototype,n),s&&e(t,s),t}}();function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var Item=function(){function e(t,n){_classCallCheck(this,e),this.$element=$(document.createElement("div")),this.icon=t,this.$element.addClass("item"),this.$element.css("background-color",n);var s=document.createElement("i");$(s).addClass("fi-"+t),this.$element.append(s),this.prev=null,this.next=null,this.isMoving=!1;var i=this;this.$element.on("mousemove",function(){clearTimeout(timeOut),timeOut=setTimeout(function(){i.next&&i.isMoving&&i.next.moveTo(i)},10)})}return _createClass(e,[{key:"moveTo",value:function(e){anime({targets:this.$element[0],left:e.$element.css("left"),top:e.$element.css("top"),duration:700,elasticity:500}),this.next&&this.next.moveTo(e)}},{key:"updatePosition",value:function(){anime({targets:this.$element[0],left:this.prev.$element.css("left"),top:this.prev.$element.css("top"),duration:200}),this.next&&this.next.updatePosition()}}]),e}(),Menu=function(){function e(t){_classCallCheck(this,e),this.$element=$(t),this.size=0,this.first=null,this.last=null,this.timeOut=null,this.hasMoved=!1,this.status="closed"}return _createClass(e,[{key:"add",value:function(e){var t=this;null==this.first?(this.first=e,this.last=e,this.first.$element.on("mouseup",function(){t.first.isMoving?t.first.isMoving=!1:t.click()}),e.$element.draggable({start:function(){t.close(),e.isMoving=!0}},{drag:function(){e.next&&e.next.updatePosition()}},{stop:function(){e.isMoving=!1,e.next.moveTo(e)}})):(this.last.next=e,e.prev=this.last,this.last=e),this.$element.after(e.$element)}},{key:"open",value:function(){this.status="open";for(var e=this.first.next,t=1,n=this.first,s=n.$element.css("left")<n.$element.css("right")?1:-1;null!=e;)anime({targets:e.$element[0],left:parseInt(n.$element.css("left"),10)+s*(50*t),top:n.$element.css("top"),duration:500}),t++,e=e.next}},{key:"close",value:function(){this.status="closed";for(var e=this.first.next,t=this.first;null!=e;)anime({targets:e.$element[0],left:t.$element.css("left"),top:t.$element.css("top"),duration:500}),0,e=e.next}},{key:"click",value:function(){"closed"==this.status?this.open():this.close()}}]),e}(),menu=new Menu("#corner"),item1=new Item("list"),item2=new Item("torso","#FF5C5C"),item3=new Item("social-facebook","#5CD1FF"),item4=new Item("paypal","#FFF15C"),item5=new Item("link","#64F592");menu.add(item1),menu.add(item2),menu.add(item3),menu.add(item4),menu.add(item5),$(document).delay(50).queue(function(e){menu.open(),e(),$(document).delay(1e3).queue(function(e){menu.close(),e()})});