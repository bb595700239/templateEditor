<template>
  <div ref="rulers" id="rulerTool" :style="{width : windowWidth + 'px',height : windowHeight + 'px',position:position}"
       class="ScaleBox" onselectstart="return false;">
    <template v-if="rulerToggle">
      <div id="levelRuler" class="ScaleRuler_h" @mousedown.stop="levelDragRuler">
        <span v-for="(item,index) in xScale" :key="index" :style="{left:index * 50 + 2 + 'px'}" class="n">{{ item.id
          }}</span>
      </div>
      <div id="verticalRuler" class="ScaleRuler_v" @mousedown.stop="verticalDragRuler">
        <span v-for="(item,index) in yScale" :key="index" :style="{top:index * 50 + 2 + 'px'}" class="n">{{ item.id
          }}</span>
      </div>
      <div id="levelDottedLine" :style="{top:verticalDottedTop + 'px'}" class="RefDot_h">
        <div class="info" :style="{left:eventX+'px'}" v-show="verticalDottedTop>0">
          {{`y:${verticalDottedTop - contentTop + 1}px`}}
        </div>
      </div>
      <div id="verticalDottedLine" :style="{left:levelDottedLeft + 'px'}" class="RefDot_v" v-show="levelDottedLeft>0">
        <div class="info" :style="{top:eventY+'px'}">{{`x:${levelDottedLeft - contentLeft + 1}px`}}</div>
      </div>
      <div v-for="item in levelLineList" :id="item.id" :title="item.truthTop+'px'" :style="{top:item.top+ 'px'}"
           :key="item.id"
           class="RefLine_h" @mousedown="dragLevelLine(item.id)"/>
      <div v-for="item in verticalLineList" :id="item.id" :title="item.truthLeft+'px'" :style="{left:item.left+ 'px'}"
           :key="item.id" class="RefLine_v" @mousedown="dragVerticalLine(item.id)"/>
    </template>
    <div id="content" :style="{left: contentLeft + 'px',top: contentTop + 'px'}">
      <slot/>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'VueRulerTool',
    components: {},
    props: {
      position: {
        type: String,
        default: 'relative',
        validator: function (val) {
          return ['absolute', 'fixed', 'relative', 'static', 'inherit'].indexOf(val) !== -1
        }
      }, // 规定元素的定位类型
      isHotKey: {
        type: Boolean, default: true
      }, // 热键开关
      isScaleRevise: {
        type: Boolean, default: false
      }, // 刻度修正(根据content进行刻度重置)
      presetLine: {
        type: Array,
        default: () => {
          return [] // { type: 'l', site: 50 }, { type: 'v', site: 180 }
        }
      }, // 预置参考线
      stageInfo: {
        type: Object,
        default: () => {
          return [] // { type: 'l', site: 50 }, { type: 'v', site: 180 }
        }
      },//舞台元素数组
      selectors: {
        type: Object,
        default: () => {
          return [] // { type: 'l', site: 50 }, { type: 'v', site: 180 }
        }
      },//舞台元素refs数组
    },
    data() {
      return {
        windowWidth: 0, // 窗口宽度
        windowHeight: 0, // 窗口高度
        contentLeft: 0,
        contentTop: 0,
        eventX: 0,
        eventY: 0,
        xScale: [], // 水平刻度
        yScale: [], // 垂直刻度
        topSpacing: 0, // 标尺与窗口上间距
        leftSpacing: 0, //  标尺与窗口左间距
        isDrag: false,
        dragFlag: '', // 拖动开始标记，可能值x(从水平标尺开始拖动),y(从垂直标尺开始拖动)
        levelLineList: [], // 生成的水平线列表
        verticalLineList: [], // 生成的垂直线列表
        levelDottedLeft: 0, // 水平虚线位置
        verticalDottedTop: 0, // 垂直虚线位置
        rulerWidth: 18, // 垂直标尺的宽度
        rulerHeight: 18, // 水平标尺的高度
        dragLineId: '', // 被移动线的ID
        maxDottedLeft: 0,// 水平虚线最大移动距离
        maxDottedTop: 0,// 垂直虚线最大移动距离
        offsetLeft: 0,
        offsetTop: 0,
        keyCode: {
          r: 82
        }, // 快捷键参数
        rulerToggle: true // 标尺辅助线显示开关
      }
    },
    watch: {
      verticalLineList: {
        handler: function (val, oldval) {
          this.$emit('verticalLine', val)
        },
        deep: true//对象内部的属性监听，也叫深度监听
      },
      levelLineList: {
        handler: function (val, oldval) {
          this.$emit('levelLine', val)
        },
        deep: true//对象内部的属性监听，也叫深度监听
      },
      'stageInfo.width': {
        handler: _.debounce(function (val, oldval) {
          this.init()
        }, 100),
        deep: true//对象内部的属性监听，也叫深度监听
      },
      'stageInfo.height': {
        handler: _.debounce(function (val, oldval) {
          this.init()
        }, 100),
        deep: true//对象内部的属性监听，也叫深度监听
      },
    },
    mounted() {
      document.documentElement.addEventListener('mousemove', this.dottedLineMove, true)
      document.documentElement.addEventListener('mouseup', this.dottedLineUp, true)
      document.documentElement.addEventListener('keyup', this.keyboard, true)
      this.init()
      this.quickGeneration(this.presetLine) // 生成预置参考线
      window.onresize =  () => { // 如果直接使用this,this指向的不是vue实例
        this.init()
      }

    },
    beforeDestroy: function () {
      document.documentElement.removeEventListener('mousemove', this.dottedLineMove, true)
      document.documentElement.removeEventListener('mouseup', this.dottedLineUp, true)
      document.documentElement.removeEventListener('keyup', this.keyboard, true)
    },
    methods: {
      init() {
        this.xScale = []
        this.yScale = []
        this.box()
        this.scaleCalc()
      },
      box() {
        /* const rulerTool = document.getElementById('rulerTool')
         this.windowWidth = rulerTool.offsetWidth
         this.windowHeight = rulerTool.offsetHeight*/
        let wrap = document.querySelector('.edit-info').getBoundingClientRect()
        const content = document.getElementById('content').getBoundingClientRect()
        this.offsetLeft = wrap.left - this.leftSpacing
        this.offsetTop = wrap.top - this.topSpacing
        this.maxDottedLeft = wrap.left + wrap.width
        this.maxDottedTop = wrap.top + wrap.height
        this.windowWidth = wrap.width - this.leftSpacing
        this.windowHeight = wrap.height - this.topSpacing
        this.contentLeft = (this.windowWidth - content.width) / 2
        this.contentTop = (this.windowHeight - content.height) / 2
        this.contentLeft = Math.ceil(this.contentLeft / 50) * 50
        this.contentTop = Math.ceil(this.contentTop / 50) * 50
        if (this.isScaleRevise) { // 根据内容部分进行刻度修正
          for (let i = 0; i < this.contentLeft; i += 1) {
            if (i % 50 === 0 && i + 50 <= this.contentLeft) {
              this.xScale.push({id: i})
            }
          }
          for (let i = 0; i < this.contentTop; i += 1) {
            if (i % 50 === 0 && i + 50 <= this.contentTop) {
              this.yScale.push({id: i})
            }
          }
        }

      }, // 获取窗口宽与高
      scaleCalc() {
        for (let i = 0; i < this.windowWidth; i += 1) {
          if (i % 50 === 0) {
            this.xScale.push({id: i})
          }
        }
        for (let i = 0; i < this.windowHeight; i += 1) {
          if (i % 50 === 0) {
            this.yScale.push({id: i})
          }
        }
      }, // 计算刻度
      newLevelLine() {
        this.isDrag = true
        this.dragFlag = 'x'
      }, // 生成一个水平参考线
      newVerticalLine() {
        this.isDrag = true
        this.dragFlag = 'y'
      }, // 生成一个垂直参考线
      yvPosition (eventX) {
        const info = [{left: 0, top: 0, time: 'canvas'}, ...this.stageInfo.items]
        for (let val of info) {
          const width = val.time == 'canvas' ? this.selectors[val.time].getBoundingClientRect().width : this.selectors[val.time][0].getBoundingClientRect().width;
          if ((val.left + this.contentLeft - 1 - 10) < eventX && eventX < (val.left + this.contentLeft - 1 + 10)) {//左线
            this.levelDottedLeft = val.left + this.contentLeft - 1;
            break;
          } else if ((val.left + width / 2 + this.contentLeft - 1 - 10) < eventX && eventX < (val.left + width / 2 + this.contentLeft - 1 + 10)) {//中心
            this.levelDottedLeft = val.left + width / 2 + this.contentLeft - 1;
            break;
          } else if ((val.left + width + this.contentLeft - 1 - 10) < eventX && eventX < (val.left + width + this.contentLeft - 1 + 10)) {//右线
            this.levelDottedLeft = val.left + width + this.contentLeft - 1;
            break;
          } else {
            this.levelDottedLeft = eventX;
          }
        }
      },//计算垂直虚线粘合的位置
      xlPosition (eventY) {
        const info = [{left: 0, top: 0, time: 'canvas'}, ...this.stageInfo.items]
        for (let val of info) {
          const height = val.time == 'canvas' ? this.selectors[val.time].getBoundingClientRect().height : this.selectors[val.time][0].getBoundingClientRect().height;
          if ((val.top + this.contentTop - 1 - 10) < eventY && eventY < (val.top + this.contentTop - 1 + 10)) {//顶线
            this.verticalDottedTop = val.top + this.contentTop - 1;
            break;
          } else if ((val.top + height / 2 + this.contentTop - 1 - 10) < eventY && eventY < (val.top + height / 2 + this.contentTop - 1 + 10)) {//中心
            this.verticalDottedTop = val.top + height / 2 + this.contentTop - 1;
            break;
          } else if ((val.top + height + this.contentTop - 1 - 10) < eventY && eventY < (val.top + height + this.contentTop - 1 + 10)) {//底线
            this.verticalDottedTop = val.top + height + this.contentTop - 1;
            break;
          } else {
            this.verticalDottedTop = eventY;
          }
        }

      },//计算水平虚线粘合的位置
      dottedLineMove($event) {
        if (this.dragFlag) {
          this.eventX = $event.pageX - this.offsetLeft
          this.eventY = $event.pageY - this.offsetTop
          //console.log(this.eventX)
        }

        switch (this.dragFlag) {
          case 'x':
            if (this.isDrag) {
              this.xlPosition(this.eventY)
            }
            break
          case 'y':
            if (this.isDrag) {
              this.yvPosition(this.eventX)
            }
            break
          case 'l':
            if (this.isDrag) {
              this.xlPosition(this.eventY)
            }
            break
          case 'v':
            if (this.isDrag) {
              this.yvPosition(this.eventX)
            }
            break
          default:
            break
        }
      }, // 虚线移动
      dottedLineUp($event) {
        if (this.isDrag) {
          this.isDrag = false
          switch (this.dragFlag) {
            case 'x':
              if ($event.pageY - this.offsetTop + 1 - this.rulerHeight <= 0 || $event.pageY > this.maxDottedTop) {
                return
              }
              this.levelLineList.push(
                {
                  id: 'levelLine' + this.levelLineList.length + 1,
                  title: $event.pageY - this.offsetTop - this.contentTop + 1 + 'px',
                  top: this.verticalDottedTop,
                  truthTop: this.verticalDottedTop - this.contentTop + 1,
                }
              )
              this.dragFlag = ''
              break
            case 'y':
              if ($event.pageX - this.offsetLeft + 1 - this.rulerWidth <= 0 || $event.pageX > this.maxDottedLeft) {
                return
              }
              this.verticalLineList.push(
                {
                  id: 'verticalLine' + this.verticalLineList.length + 1,
                  title: $event.pageX - this.offsetLeft - this.contentLeft + 1 + 'px',
                  left: this.levelDottedLeft,
                  truthLeft: this.levelDottedLeft - this.contentLeft + 1,
                }
              )
              this.dragFlag = ''
              break
            case 'l':
              if ($event.pageY - this.offsetTop < this.rulerHeight || $event.pageY > this.maxDottedTop) {//18为刻度的宽度
                let Index, id
                this.levelLineList.forEach((item, index) => {
                  if (item.id === this.dragLineId) {
                    Index = index
                    id = item.id
                  }
                })
                this.levelLineList.splice(Index, 1)
              } else {
                let Index, id
                this.levelLineList.forEach((item, index) => {
                  if (item.id === this.dragLineId) {
                    Index = index
                    id = item.id
                  }
                })
                this.levelLineList.splice(Index, 1, {
                  id: id,
                  title: $event.pageY - this.offsetTop - this.contentTop + 1 + 'px',
                  top: this.verticalDottedTop,
                  truthTop: this.verticalDottedTop - this.contentTop + 1,
                })
              }
              this.dragFlag = ''
              break
            case 'v':
              if ($event.pageX - this.offsetLeft < this.rulerWidth || $event.pageX > this.maxDottedLeft) {//18为刻度的宽度
                let Index, id
                this.verticalLineList.forEach((item, index) => {
                  if (item.id === this.dragLineId) {
                    Index = index
                    id = item.id
                  }
                })
                this.verticalLineList.splice(Index, 1)
              } else {
                let Index, id
                this.verticalLineList.forEach((item, index) => {
                  if (item.id === this.dragLineId) {
                    Index = index
                    id = item.id
                  }
                })
                this.verticalLineList.splice(Index, 1, {
                  id: id,
                  title: $event.pageX - this.offsetLeft - this.contentLeft + 1 + 'px',
                  left: this.levelDottedLeft,
                  truthLeft: this.levelDottedLeft - this.contentLeft + 1,
                })
              }
              this.dragFlag = ''
              break
            default:
              break
          }
          this.verticalDottedTop = this.levelDottedLeft = -200
        }
      }, // 虚线松开
      levelDragRuler() {
        this.newLevelLine()
      }, // 水平标尺处按下鼠标
      verticalDragRuler() {
        this.newVerticalLine()
      }, // 垂直标尺处按下鼠标
      dragLevelLine(id) {
        this.isDrag = true
        this.dragFlag = 'l'
        this.dragLineId = id
      }, // 水平线处按下鼠标
      dragVerticalLine(id) {
        this.isDrag = true
        this.dragFlag = 'v'
        this.dragLineId = id
      }, // 垂直线处按下鼠标
      keyboard($event) {
        if (this.isHotKey) {
          switch ($event.keyCode) {
            case this.keyCode.r:
              this.rulerToggle = !this.rulerToggle
              break
          }
        }
      }, // 键盘事件
      quickGeneration(params) {
        if (params !== []) {
          params.forEach(item => {
            switch (item.type) {
              case 'l':
                this.levelLineList.push({
                  id: 'levelLine' + this.levelLineList.length + 1,
                  title: item.site - this.contentLeft + 'px',
                  top: item.site
                })
                break
              case 'v':
                this.verticalLineList.push({
                  id: 'verticalLine' - this.contentTop + this.verticalLineList.length + 1,
                  title: item.site + 'px',
                  left: item.site
                })
                break
              default:
                break
            }
          })
        }
      } // 快速生成参考线
    }
  }
</script>

<style scoped lang="scss">
  .ScaleBox {
    left: 0;
    top: 0;
    z-index: 999;
    overflow: hidden;
    user-select: none;
  }

  .ScaleRuler_h, .ScaleRuler_v, .RefLine_v, .RefLine_h, .RefDot_h, .RefDot_v {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 999;
  }

  .ScaleRuler_h {
    width: 100%;
    height: 18px;
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAASCAMAAAAuTX21AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAlQTFRFMzMzAAAA////BqjYlAAAACNJREFUeNpiYCAdMDKRCka1jGoBA2JZZGshiaCXFpIBQIABAAplBkCmQpujAAAAAElFTkSuQmCC) repeat-x; /*./image/ruler_h.png*/
  }

  .ScaleRuler_v {
    width: 18px;
    height: 100%;
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAyCAMAAABmvHtTAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAlQTFRFMzMzAAAA////BqjYlAAAACBJREFUeNpiYGBEBwwMTGiAakI0NX7U9aOuHyGuBwgwAH6bBkAR6jkzAAAAAElFTkSuQmCC) repeat-y; /*./image/ruler_v.png*/
  }

  .ScaleRuler_v .n, .ScaleRuler_h .n {
    position: absolute;
    font: 10px/1 Arial, sans-serif;
    color: #333;
    cursor: default;
  }

  .ScaleRuler_v .n {
    width: 8px;
    left: 3px;
    word-wrap: break-word;
  }

  .ScaleRuler_h .n {
    top: 1px;
  }

  .RefLine_v, .RefLine_h, .RefDot_h, .RefDot_v {
    z-index: 998;
  }

  .RefLine_h {
    width: 100%;
    height: 3px;
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAABCAMAAADU3h9xAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRFSv//AAAAH8VRuAAAAA5JREFUeNpiYIACgAADAAAJAAE0lmO3AAAAAElFTkSuQmCC) repeat-x left center; /*./image/line_h.png*/
    cursor: n-resize; /*url(./image/cur_move_h.cur), move*/
  }

  .RefLine_v {
    width: 3px;
    height: 100%;
    _height: 9999px;
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAICAMAAAAPxGVzAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRFSv//AAAAH8VRuAAAAA5JREFUeNpiYEAFAAEGAAAQAAGePof9AAAAAElFTkSuQmCC) repeat-y center top; /*./image/line_v.png*/
    cursor: w-resize; /*url(./image/cur_move_v.cur), move*/
  }

  .RefDot_h {
    width: 100%;
    height: 3px;
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAMAAABFaP0WAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRFf39/////F3PnHQAAAAJ0Uk5T/wDltzBKAAAAEElEQVR42mJgYGRgZAQIMAAADQAExkizYQAAAABJRU5ErkJggg==) repeat-x left 1px; /*./image/line_dot.png*/
    cursor: n-resize; /*url(./image/cur_move_h.cur), move*/
    top: -10px;
    .info {
      margin-top: -40px;
    }
  }

  .RefDot_v {
    width: 3px;
    height: 100%;
    _height: 9999px;
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAMAAABFaP0WAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRFf39/////F3PnHQAAAAJ0Uk5T/wDltzBKAAAAEElEQVR42mJgYGRgZAQIMAAADQAExkizYQAAAABJRU5ErkJggg==) repeat-y 1px top; /*./image/line_dot.png*/
    cursor: w-resize; /*url(./image/cur_move_v.cur), move*/
    left: -10px;
    .info {
      margin-left: 40px;
    }
  }

  .info {
    position: absolute;
    color: #fff;
    background-color: rgba(0, 0, 0, .6);
    padding: 4px 6px;
    border-radius: 5px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, .3);
  }

  #content {
    position: absolute;
    left: 50%;
    top: 50%;

  }
</style>
