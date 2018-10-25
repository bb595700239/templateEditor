<template>
  <div class="template-editor">
    <div class="edit-btns flex-box">
      <div class="create-btn-wrap">
        <el-dropdown class="create-btn" trigger="click" @command="handleCommand">
          <el-button size="mini">
            新建元素<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="text">文本</el-dropdown-item>
            <el-dropdown-item command="prop">字段</el-dropdown-item>
            <el-dropdown-item command="table">表格</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="pannel-block-align">
        <ul class="block" :class="{active:isAlignment}">
          <li class="label" @click="itemAlign('top')">
            <i class="fontalign icon-top"></i>
          </li>
          <li class="label" @click="itemAlign('middle')">
            <i class="fontalign icon-middle"></i>
          </li>
          <li class="label" @click="itemAlign('bottom')">
            <i class="fontalign icon-bottom"></i>
          </li>
          <li class="label" @click="itemAlign('left')">
            <i class="fontalign icon-left"></i>
          </li>
          <li class="label" @click="itemAlign('center')">
            <i class="fontalign icon-center"></i>
          </li>
          <li class="label" @click="itemAlign('right')">
            <i class="fontalign icon-right"></i>
          </li>
        </ul>
        <ul class="block" :class="{active:isDistribution}">
          <li class="label" @click="itemAlign('topDistribute')">
            <i class="fontalign icon-topDistribute"></i>
          </li>
          <li class="label" @click="itemAlign('verticalCenter')">
            <i class="fontalign icon-verticalCenter"></i>
          </li>
          <li class="label" @click="itemAlign('bottomDistribute')">
            <i class="fontalign icon-bottomDistribute"></i>
          </li>
          <li class="label" @click="itemAlign('leftDistribute')">
            <i class="fontalign icon-leftDistribute"></i>
          </li>
          <li class="label" @click="itemAlign('horizontalCenter')">
            <i class="fontalign icon-horizontalCenter"></i>
          </li>
          <li class="label" @click="itemAlign('rightDistribute')">
            <i class="fontalign icon-rightDistribute"></i>
          </li>
        </ul>
      </div>
      <el-button size="mini" type="danger" @click="clear">
        清空
      </el-button>
      <el-button size="mini" type="success" @click="getPdf">
        下载PDF
      </el-button>
    </div>
    <div class="edit-content">
      <div class="edit-info">
        <ruler-tool
          :is-scale-revise="true"
          :stage-info='canvas'
          :selectors="$refs"
          @verticalLine="geInfo($event,'verticalLineList')"
          @levelLine="geInfo($event,'levelLineList')"
        >
          <div class="edit-canvas"
               :class="[{active:select.indexOf(canvas)>-1}]"
               ref="canvas"
               :style="{width:`${canvas.width}px`, height:`${canvas.height}px`,background:canvas.background}"
               @click.exact.stop="handleSelect(canvas)"

               @keydown.delete="handledelete"
               @click.ctrl.stop="handleSelectMultiple(canvas)">
            <div class="item"
                 :ref="item.time"
                 :style="{left:`${item.left}px`,top:`${item.top}px`,fontSize:`${item.fontSize}px`,fontWeight:item.fontWeight?'bold':'normal',fontStyle:item.fontStyle?'italic':'normal',color:`${item.fontColor}`}"
                 v-for="(item,index) in canvas.items"
                 v-if="item.type === 'text'"
                 @click.exact.stop="handleSelect(item)"
                 @click.ctrl.stop="handleSelectMultiple(item)"
                 @mousedown.exact.stop="handleonmousedown($event,null,null,item)"
                 @keydown.up="item.top-=1"
                 @keydown.down="item.top+=1"
                 @keydown.left="item.left-=1"
                 @keydown.right="item.left+=1"
                 :class="[{active:select.indexOf(item)>-1}]"
                 :key="index"
                 :tabindex="index"
            >
              {{item.content}}
            </div>
            <div class="item"
                 :ref="item.time"
                 :style="{left:`${item.left}px`,top:`${item.top}px`,fontSize:`${item.labelFontSize}px`,fontWeight:item.labelFontWeight?'bold':'normal',color:`${item.labelFontColor}`}"
                 v-for="(item,index) in canvas.items"
                 v-if="item.type === 'prop'"
                 @click.exact.stop="handleSelect(item)"
                 @click.ctrl.stop="handleSelectMultiple(item)"
                 @mousedown.exact.stop="handleonmousedown($event,null,null,item)"
                 @keydown.up="item.top-=1"
                 @keydown.down="item.top+=1"
                 @keydown.left="item.left-=1"
                 @keydown.right="item.left+=1"
                 :class="[{active:select.indexOf(item)>-1}]"
                 :key="index"
                 :tabindex="index"
            >
              {{item.label}}
              <span
                :style="{fontSize:`${item.valueFontSize}px`,fontWeight:item.valueFontWeight?'bold':'normal',color:`${item.valueFontColor}`,marginLeft:`${item.valueMarginLeft}px`}">{{'{' + item.value + '}'}}</span>
            </div>

            <div class="item g-table"
                 :ref="item.time"
                 :style="{left:`${item.left}px`,top:`${item.top}px`,height:`${item.allHeight}px`,borderColor:`${item.borderColor}`,borderWidth:`${item.borderWidth}px`}"
                 v-for="(item,index) in canvas.items"
                 v-if="item.type === 'table'"
                 @click.exact.stop="handleSelect(item)"
                 @click.ctrl.stop="handleSelectMultiple(item)"
                 @mousedown.exact.stop="handleonmousedown($event,null,null,item)"
                 @keydown.up="item.top-=1"
                 @keydown.down="item.top+=1"
                 @keydown.left="item.left-=1"
                 @keydown.right="item.left+=1"
                 :class="[{active:select.indexOf(item)>-1}]"
                 :key="index"
                 :tabindex="index"
            >
              <div class="g-tHead flex-box"
                   :style="{borderBottomWidth:`${item.borderWidth}px`,borderColor:`${item.borderColor}`}">
                <div class="g-column" v-for="(column,columnIndex) in item.tHead" :key="columnIndex"
                     :style="{borderRightWidth:`${item.borderWidth}px`,borderColor:`${item.borderColor}`,fontSize:`${item.tHeadFontSize}px`,fontWeight:item.tHeadFontWeight?'bold':'normal',color:`${item.tHeadFontColor}`,lineHeight:`${item.tHeadHeight}px`,width:`${column.width}px`}">
                  {{column.content}}
                </div>
              </div>
              <div class="g-line-box flex-box"
                   :style="{height:`calc(100% - ${item.tHeadHeight}px - ${item.borderWidth}px)`}">
                <div class="g-column" v-for="(column,columnIndex) in item.tHead" :key="columnIndex"
                     :style="{borderRightWidth:`${item.borderWidth}px`,borderColor:`${item.borderColor}`,width:`${column.width}px`,height:item.valueHeight*item.lineNumber>Number(`calc(100% - ${item.tHeadHeight}px - ${item.borderWidth}px)`)?`auto`:`100%`}">
                  <p class="g-line" v-for="(line,lineIndex) in item.lineNumber" :key="lineIndex" :style="{borderBottomWidth:`${item.borderWidth}px`,borderColor:`${item.borderColor}`,fontSize:`${item.valueFontSize}px`,fontWeight:item.valueFontWeight?'bold':'normal',color:`${item.valueFontColor}`,
                lineHeight:item.valueHeight*item.lineNumber>(item.allHeight-item.tHeadHeight-item.borderWidth)?`${item.valueHeight}px`:`calc((${item.allHeight}px - ${item.tHeadHeight}px - ${item.borderWidth}px - ${(item.lineNumber-1)*item.borderWidth}px) / ${item.lineNumber})`}">
                    {{'{' + column.value + '}'}}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ruler-tool>

      </div>
      <div class="edit-pannel">
        <div v-if="select.length === 1">
          <div class="pannel-block-attr" v-if="select[0].type === 'canvas'">
            <div class="block-tit">模板</div>
            <ul class="block">
              <li class="label" @mousewheel="handlemousewheel($event,null,'width')"
                  @mousedown="handleonmousedown($event,null,'width')">
                <span>宽度</span>
                <div class="info">{{select[0].width}}</div>
              </li>
              <li class="label" @mousewheel="handlemousewheel($event,null,'height')"
                  @mousedown="handleonmousedown($event,null,'height')">
                <span>高度</span>
                <div class="info">{{select[0].height}}</div>
              </li>
              <li class="label">
                <span>背景颜色</span>
                <div class="info">
                  <el-color-picker size="small" v-model="select[0].background"></el-color-picker>
                </div>
              </li>
            </ul>
          </div>

          <div class="pannel-block-attr" v-if="select[0].type === 'text'">
            <div class="block-tit">文字</div>
            <ul class="block">
              <li class="label input">
                <span>内容</span>
                <div class="info"><input type="text" v-model="select[0].content"></div>
              </li>
              <li class="label" @mousewheel.prevent="handlemousewheel($event,null,'left')"
                  @mousedown="handleonmousedown($event,null,'left')">
                <span>X</span>
                <div class="info">{{select[0].left}}</div>
              </li>
              <li class="label" @mousewheel.prevent="handlemousewheel($event,null,'top')"
                  @mousedown="handleonmousedown($event,null,'top')">
                <span>Y</span>
                <div class="info">{{select[0].top}}</div>
              </li>
              <li class="label" @mousewheel.prevent="handlemousewheel($event,null,'fontSize')"
                  @mousedown="handleonmousedown($event,null,'fontSize')">
                <span>文字大小</span>
                <div class="info">{{select[0].fontSize}}</div>
              </li>
              <li class="label">
                <span>文字颜色</span>
                <div class="info">
                  <el-color-picker size="small" v-model="select[0].fontColor"></el-color-picker>
                </div>
              </li>
              <li class="label">
                <span>文字加粗</span>
                <div class="info">
                  <el-switch v-model="select[0].fontWeight"></el-switch>
                </div>
              </li>
              <li class="label">
                <span>文字倾斜</span>
                <div class="info">
                  <el-switch v-model="select[0].fontStyle"></el-switch>
                </div>
              </li>
            </ul>
          </div>

          <div class="pannel-block-attr" v-if="select[0].type === 'prop'">
            <div class="block-tit">字段</div>
            <ul class="block">
              <li class="label input">
                <span>标签</span>
                <div class="info"><input type="text" v-model="select[0].label"></div>
              </li>
              <li class="label" @mousewheel.prevent="handlemousewheel($event,null,'left')"
                  @mousedown="handleonmousedown($event,null,'left')">
                <span>X</span>
                <div class="info">{{select[0].left}}</div>
              </li>
              <li class="label" @mousewheel.prevent="handlemousewheel($event,null,'top')"
                  @mousedown="handleonmousedown($event,null,'top')">
                <span>Y</span>
                <div class="info">{{select[0].top}}</div>
              </li>
              <li class="label" @mousewheel.prevent="handlemousewheel($event,null,'labelFontSize')"
                  @mousedown="handleonmousedown($event,null,'labelFontSize')">
                <span>标签文字大小</span>
                <div class="info">{{select[0].labelFontSize}}</div>
              </li>
              <li class="label">
                <span>标签文字颜色</span>
                <div class="info">
                  <el-color-picker size="small" v-model="select[0].labelFontColor"></el-color-picker>
                </div>
              </li>
              <li class="label">
                <span>标签文字加粗</span>
                <div class="info">
                  <el-switch v-model="select[0].labelFontWeight"></el-switch>
                </div>
              </li>
              <li class="label" @mousewheel.prevent="handlemousewheel($event,null,'valueFontSize')"
                  @mousedown="handleonmousedown($event,null,'valueFontSize')">
                <span>值文字大小</span>
                <div class="info">{{select[0].valueFontSize}}</div>
              </li>
              <li class="label">
                <span>值文字颜色</span>
                <div class="info">
                  <el-color-picker size="small" v-model="select[0].valueFontColor"></el-color-picker>
                </div>
              </li>
              <li class="label">
                <span>值文字加粗</span>
                <div class="info">
                  <el-switch v-model="select[0].valueFontWeight"></el-switch>
                </div>
              </li>
              <li class="label" @mousewheel.prevent="handlemousewheel($event,null,'valueMarginLeft')"
                  @mousedown="handleonmousedown($event,null,'valueMarginLeft')">
                <span>值与标签的距离</span>
                <div class="info">{{select[0].valueMarginLeft}}</div>
              </li>
            </ul>
          </div>

          <div class="pannel-block-attr" v-if="select[0].type === 'table'">
            <div class="block-tit">表格</div>
            <ul class="block">
              <!--<li class="label" @mousewheel.prevent="handlemousewheel($event,null,'columnNumber',tableChange)"
                  @mousedown="handleonmousedown($event,null,'columnNumber',null,tableChange)">
                <span>列数</span>
                <div class="info">{{select[0].columnNumber}}</div>
              </li>-->
              <li class="label" @mousewheel.prevent="handlemousewheel($event,null,'boxWidth',tableChange)"
                  @mousedown="handleonmousedown($event,null,'boxWidth',null,tableChange)">
                <span>平均列宽</span>
                <div class="info">{{select[0].boxWidth}}</div>
              </li>
              <li class="label" @mousewheel.prevent="handlemousewheel($event,null,'borderWidth')"
                  @mousedown="handleonmousedown($event,null,'borderWidth')">
                <span>边框宽度</span>
                <div class="info">{{select[0].borderWidth}}</div>
              </li>
              <li class="label">
                <span>边框颜色</span>
                <div class="info">
                  <el-color-picker size="small" v-model="select[0].borderColor"></el-color-picker>
                </div>
              </li>
              <li class="label" @mousewheel.prevent="handlemousewheel($event,null,'allHeight')"
                  @mousedown="handleonmousedown($event,null,'allHeight')">
                <span>表高</span>
                <div class="info">{{select[0].allHeight}}</div>
              </li>
              <li class="label" @mousewheel.prevent="handlemousewheel($event,null,'left')"
                  @mousedown="handleonmousedown($event,null,'left')">
                <span>X</span>
                <div class="info">{{select[0].left}}</div>
              </li>
              <li class="label" @mousewheel.prevent="handlemousewheel($event,null,'top')"
                  @mousedown="handleonmousedown($event,null,'top')">
                <span>Y</span>
                <div class="info">{{select[0].top}}</div>
              </li>
              <li class="label" @mousewheel.prevent="handlemousewheel($event,null,'tHeadFontSize')"
                  @mousedown="handleonmousedown($event,null,'tHeadFontSize')">
                <span>表头文字大小</span>
                <div class="info">{{select[0].tHeadFontSize}}</div>
              </li>
              <li class="label" @mousewheel.prevent="handlemousewheel($event,null,'tHeadHeight')"
                  @mousedown="handleonmousedown($event,null,'tHeadHeight')">
                <span>表头行高</span>
                <div class="info">{{select[0].tHeadHeight}}</div>
              </li>
              <li class="label">
                <span>表头文字颜色</span>
                <div class="info">
                  <el-color-picker size="small" v-model="select[0].tHeadFontColor"></el-color-picker>
                </div>
              </li>
              <li class="label">
                <span>表头文字加粗</span>
                <div class="info">
                  <el-switch v-model="select[0].tHeadFontWeight"></el-switch>
                </div>
              </li>
              <li class="label" @mousewheel.prevent="handlemousewheel($event,null,'valueFontSize')"
                  @mousedown="handleonmousedown($event,null,'valueFontSize')">
                <span>值文字大小</span>
                <div class="info">{{select[0].valueFontSize}}</div>
              </li>
              <li class="label">
                <span>值文字颜色</span>
                <div class="info">
                  <el-color-picker size="small" v-model="select[0].valueFontColor"></el-color-picker>
                </div>
              </li>
              <li class="label">
                <span>值文字加粗</span>
                <div class="info">
                  <el-switch v-model="select[0].valueFontWeight"></el-switch>
                </div>
              </li>
            </ul>
            <div v-for="(item,index) in select[0].tHead" :key="index">
              <div class="block-tit">第{{index + 1}}列</div>
              <ul class="block">
                <li class="label small-input">
                  <span>标签</span>
                  <div class="info"><input type="text" v-model="item.content"></div>
                </li>
                <li class="label" @mousewheel.prevent="handlemousewheel($event,item,'width')"
                    @mousedown="handleonmousedown($event,item,'width')">
                  <span>列宽</span>
                  <div class="info">{{item.width}}</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
  import _ from 'lodash'
  import html2Canvas from 'html2canvas'
  import JsPDF from 'jspdf'
  import rulerTool from './ruler-tool.vue'

  export default {
    data() {
      return {
        elements: {
          text: {
            type: 'text',
            content: 'joubn',
            fontSize: 36,
            fontColor: '#000',
            fontWeight: false,
            fontStyle: false,
            left: 0,
            top: 0
          },
          prop: {
            type: 'prop',
            label: '姓名:',
            labelFontSize: 36,
            labelFontWeight: false,
            labelFontColor: '#000',
            value: 'name',
            valueFontSize: 20,
            valueFontWeight: false,
            valueFontColor: '#000',
            valueMarginLeft: 0,
            left: 0,
            top: 0
          },
          table: {
            type: 'table',
            columnNumber: 2,
            lineNumber: 1,
            boxWidth: 100,
            allHeight: 300,
            borderColor: '#000',
            borderWidth: 2,
            tHead: [{
              content: '姓名',
              width: 100,
              value: 'name',
            }, {
              content: '姓名',
              width: 100,
              value: 'name',
            }],
            tHeadHeight: 60,
            tHeadFontSize: 30,
            tHeadFontWeight: false,
            tHeadFontColor: '#000',
            valueFontSize: 20,
            valueFontWeight: false,
            valueFontColor: '#000',
            valueHeight: 60,
            left: 0,
            top: 0
          },
        },
        canvas: {
          type: 'canvas',
          width: 800,
          height: 500,
          background: '#fff',
          left: 0,
          top: 0,
          time: new Date().getTime(),
          items: []
        },

        select: [],
        move: false,
        back: false,
        verticalLineList: [],
        levelLineList: [],
        contentTop: 0,
        contentLeft: 0,
      }
    },
    props: {
      initCanvas: {
      }
    },
    created() {
    },
    mounted() {
      document.onmouseup = function () {
        document.onmousemove = null;
      }
      document.onkeyup = (e) => {
        if (e.ctrlKey) {
          if (e.keyCode == 90) { //ctrl + Z
            this.back = false
          }
          if (e.keyCode == 67) {  //ctrl + C
            this.handlecopy()
          }
        }
      }
      document.onkeydown = (e) => {
        if (e.ctrlKey) {
          if (e.keyCode == 90) {
            this.handleback()
          }
        }
      }
    },
    computed: {
      selectOne(){
        return this.select[0]
      },
      hasCanvas(){
        const some = this.select.some(item => {
          return item.type === 'canvas'
        })
        return some
      },
      isAlignment () {
        if (this.select.length === 0 || (this.select.length === 1 && this.hasCanvas)) {
          return false
        } else {
          return true
        }
      },
      isDistribution () {
        if (this.select.length === 0 || this.select.length < 3 || this.hasCanvas) {
          return false
        } else {
          return true
        }
      }
    },
    methods: {
      geInfo(info,name){
        this[name] = info;
      },
      getPdf(){
        let pdfDom = this.$refs.canvas
        var title = 'template'
        html2Canvas(pdfDom, {allowTaint: true}).then(function (canvas) {
          let contentWidth = canvas.width
          let contentHeight = canvas.height
          let pageData = canvas.toDataURL('image/jpeg', 2)
          let PDF = new JsPDF('landscape', 'pt', [contentWidth, contentHeight])
          PDF.addImage(pageData, 'PNG', 0, 0, contentWidth, contentHeight)
          PDF.addPage()
          PDF.addImage(pageData, 'PNG', 0, 0, contentWidth, contentHeight)
          PDF.save(title + '.pdf')
        })
      },
      clear(){
        this.select = []
        this.canvas.items = []
      },
      tableChange (type) {
        const obj = this.selectOne;
        if (type === 'columnNumber') {
          this.$emit('columnNumber', obj.columnNumber);
          this.handleCommandSend('table');
        }
        if (type === 'boxWidth') {
          obj.tHead.forEach(val => {
            this.$set(val, 'width', obj.boxWidth);
          })
        }
      },
      handleSelect(obj){
        if (!this.move) {
          this.select = [obj]
        }
        this.move = false
      },
      handleSelectMultiple(obj){
        if (this.select.indexOf(obj) > -1) {
          this.select.remove(obj)
        } else {
          this.select.push(obj)
        }
      },
      handledelete(){
        this.select.forEach(item => {
          this.canvas.items.remove(item)
        })

        this.select = []
      },
      handleback(){
        this.back = true
        if (this.$store.state.history.length == 0) {
          return
        }
        if (this.$store.state.history.length == 1) {
          this.canvas = this.$store.state.history[0]
          this.$store.state.history.pop()
          return
        }
        this.canvas = this.$store.state.history[this.$store.state.history.length - 2]
        this.$store.state.history.pop()
      },
      handlemousewheel(e, obj, prop, callback){
        const delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        if (!obj) {
          obj = this.selectOne
        }

        // 默认所有值都不能小于0
        if (obj[prop] + delta < 0) {
          return
        }

        obj[prop] += delta
        if (callback) {
          callback(prop)
        }
      },
      handleonmousedown(e, obj, prop, item, callback){
        if (item && this.select.length < 2) {
          this.select = [item]
        }
        if (!obj) {
          obj = this.selectOne
        }
        const pageY = e.clientY;
        const pageX = e.clientX;
        let oldclientY = pageY
        let oldclientX = pageX
        if (this.select.length === 1&&this.select[0].type !== 'canvas') {
          const itemInfo = this.$refs[this.select[0].time][0].getBoundingClientRect()
          var itemWidth = itemInfo.width
          var itemHeight = itemInfo.height
          var propTop = obj['top'];
          var propLeft = obj['left'];
        }

        if (!document.onmousemove) {
          document.onmousemove = (event) => {

            if (prop) {
              // 默认所有值都不能小于0
              if (obj[prop] + (event.clientY - oldclientY) < 0) {
                return
              }
              obj[prop] += event.clientY - oldclientY
            } else {
              if (this.select.length === 1) {
                /*obj['top'] += event.clientY - oldclientY;
                 obj['left'] += event.clientX - oldclientX;*/
                obj['top'] = propTop + event.clientY - pageY;
                obj['left'] = propLeft + event.clientX - pageX;
                if (this.levelLineList.length>0) {
                  for (let val of this.levelLineList) {
                    if (val.truthTop - 10 < obj['top'] && obj['top']<val.truthTop + 10) {
                      obj['top'] = val.truthTop;
                      break
                    }
                    if (val.truthTop - 10 < obj['top']+itemHeight/2 && obj['top']+itemHeight/2<val.truthTop + 10) {
                      obj['top'] = val.truthTop - itemHeight/2;
                      break
                    }
                    if (val.truthTop - 10 < obj['top']+itemHeight && obj['top']+itemHeight<val.truthTop + 10) {
                      obj['top'] = val.truthTop - itemHeight;
                      break
                    }
                  }
                }
                if (this.verticalLineList.length>0) {
                  for (let val of this.verticalLineList) {
                    if (val.truthLeft - 10 < obj['left'] && obj['left']<val.truthLeft + 10) {
                      obj['left'] = val.truthLeft;
                      break
                    }
                    if (val.truthLeft - 10 < obj['left']+itemWidth/2 && obj['left']+itemWidth/2<val.truthLeft + 10) {
                      obj['left'] = val.truthLeft - itemWidth/2;
                      break
                    }
                    if (val.truthLeft - 10 < obj['left']+itemWidth && obj['left']+itemWidth<val.truthLeft + 10) {
                      obj['left'] = val.truthLeft - itemWidth;
                      break
                    }
                  }
                }
              } else {
                this.move = true
                this.select.forEach((item) => {
                  if (item.type != 'canvas') {
                    item['top'] += event.clientY - oldclientY
                    item['left'] += event.clientX - oldclientX
                  }
                })
              }
            }

            oldclientY = event.clientY
            oldclientX = event.clientX

            if (callback) {
              callback(prop)
            }
          }
        }

      },
      handleCommand(command){
        const info = JSON.parse(JSON.stringify(this.elements[command]))
        info.time = new Date().getTime()
        this.canvas.items.push(info)
      },
      handlecopy(){
        this.select.forEach((obj)=>{
          obj = JSON.parse(JSON.stringify(obj))
          obj.time = new Date().getTime()
          this.canvas.items.push(obj)
        })
      },
      itemAlign(local){
        const canvasWidth = this.canvas.width
        const canvasHeight = this.canvas.height
        if (this.select.length === 1) {
          if (this.hasCanvas) {
            return
          }
          const itemInfo = this.$refs[this.select[0].time][0].getBoundingClientRect()
          const itemWidth = itemInfo.width
          const itemHeight = itemInfo.height
          switch (local) {
            case 'left':
              this.selectOne.left = 0
              break;
            case 'center':
              this.selectOne.left = (canvasWidth - itemWidth) / 2
              break;
            case 'right':
              this.selectOne.left = canvasWidth - itemWidth
              break;
            case 'top':
              this.selectOne.top = 0
              break;
            case 'middle':
              this.selectOne.top = (canvasHeight - itemHeight) / 2
              break;
            case 'bottom':
              this.selectOne.top = canvasHeight - itemHeight
              break;
          }
        } else {
          const info = {
            minleft: 99999999999999,
            maxleft: 0,
            center: {width: 0, left: 0},
            minright: 99999999999999,
            maxright: 0,
            mintop: 99999999999999,
            maxtop: 0,
            middle: {height: 0, top: 0},
            minbottom: 99999999999999,
            maxbottom: 0,
            maxLineCenter: 0,//最低中心线
            minLineCenter: 99999999999999,//最高中心线
            maxColCenter: 0,//最右中心线
            minColCenter: 99999999999999,//最左中心线
          }
          this.select.forEach((val, i) => {
            let minleft = 0
            let maxleft = 0
            let width = 0
            let maxright = 0
            let minright = 0

            let mintop = 0
            let maxtop = 0
            let height = 0
            let maxbottom = 0
            let minbottom = 0

            let maxLineCenter = 0
            let minLineCenter = 0
            let maxColCenter = 0
            let minColCenter = 0
            if (val.type === 'canvas') {
              minleft = 0
              width = this.canvas.width
              maxright = this.canvas.width

              mintop = 0
              height = this.canvas.height
              maxbottom = this.canvas.height
            } else {
              minleft = Math.max(val.left, 0)
              maxleft = Math.min(val.left, this.canvas.width);
              width = Math.min(this.$refs[val.time][0].getBoundingClientRect().width, this.canvas.width)
              minright = Math.max(this.$refs[val.time][0].getBoundingClientRect().width + val.left, 0);
              maxright = Math.min(this.$refs[val.time][0].getBoundingClientRect().width + val.left, this.canvas.width)

              mintop = Math.max(val.top, 0)
              maxtop = Math.min(val.top, this.canvas.height);
              height = Math.min(this.$refs[val.time][0].getBoundingClientRect().height, this.canvas.height)
              minbottom = Math.max(this.$refs[val.time][0].getBoundingClientRect().height + val.top, 0);
              maxbottom = Math.min(this.$refs[val.time][0].getBoundingClientRect().height + val.top, this.canvas.height)

              maxLineCenter = Math.min(val.top + this.$refs[val.time][0].getBoundingClientRect().height / 2, this.canvas.height);
              minLineCenter = Math.max(val.top + this.$refs[val.time][0].getBoundingClientRect().height / 2, 0);
              maxColCenter = Math.min(val.left + this.$refs[val.time][0].getBoundingClientRect().width / 2, this.canvas.width);
              minColCenter = Math.max(val.left + this.$refs[val.time][0].getBoundingClientRect().width / 2, 0);
            }
            if (minleft < info.minleft) {
              info.minleft = minleft
            }
            if (maxleft > info.maxleft) {
              info.maxleft = maxleft
            }
            if (width > info.center.width) {
              info.center.width = width
              info.center.left = this.select[i].left
            }
            if (minright < info.minright) {
              info.minright = minright
            }
            if (maxright > info.maxright) {
              info.maxright = maxright
            }

            if (mintop < info.mintop) {
              info.mintop = mintop
            }
            if (maxtop > info.maxtop) {
              info.maxtop = maxtop
            }
            if (height > info.middle.height) {
              info.middle.height = height
              info.middle.top = this.select[i].top
            }
            if (minbottom < info.minbottom) {
              info.minbottom = minbottom
            }
            if (maxbottom > info.maxbottom) {
              info.maxbottom = maxbottom
            }
            if (maxLineCenter > info.maxLineCenter) {
              info.maxLineCenter = maxLineCenter
            }
            if (minLineCenter < info.minLineCenter) {
              info.minLineCenter = minLineCenter
            }
            if (maxColCenter > info.maxColCenter) {
              info.maxColCenter = maxColCenter
            }
            if (minColCenter < info.minColCenter) {
              info.minColCenter = minColCenter
            }

          })
          switch (local) {
            case 'left':
              this.select.forEach(item => {
                item.left = info.minleft
              })
              break;
            case 'center':
              this.select.forEach(item => {
                if (item.type != 'canvas') {
                  item.left = info.center.left + (info.center.width - this.$refs[item.time][0].getBoundingClientRect().width) / 2
                }
              })
              break;
            case 'right':
              this.select.forEach(item => {
                if (item.type != 'canvas') {
                  item.left = info.maxright - this.$refs[item.time][0].getBoundingClientRect().width
                }
              })
              break;
            case 'top':
              this.select.forEach(item => {
                item.top = info.mintop
              })
              break;
            case 'middle':
              this.select.forEach(item => {
                if (item.type != 'canvas') {
                  item.top = info.middle.top + (info.middle.height - this.$refs[item.time][0].getBoundingClientRect().height) / 2
                }
              })
              break;
            case 'bottom':
              this.select.forEach(item => {
                if (item.type != 'canvas') {
                  item.top = info.maxbottom - this.$refs[item.time][0].getBoundingClientRect().height
                }
              })
              break;
            case 'verticalCenter'://垂直中心对齐
              const verticalAverageDistance = (info.maxLineCenter - info.minLineCenter) / (this.select.length - 1);//平均距离
              this.select = this.select.sort((x, y) => {
                return (x.top + this.$refs[x.time][0].getBoundingClientRect().height / 2) - (y.top + this.$refs[y.time][0].getBoundingClientRect().height / 2);
              })
              this.select.forEach((item, i) => {
                item.top = info.minLineCenter + verticalAverageDistance * i - this.$refs[this.select[i].time][0].getBoundingClientRect().height / 2;
              })
              break;
            case 'horizontalCenter'://水平中心对齐
              const horizontalAverageDistance = (info.maxColCenter - info.minColCenter) / (this.select.length - 1);//平均距离
              this.select = this.select.sort((x, y) => {
                return (x.left + this.$refs[x.time][0].getBoundingClientRect().width / 2) - (y.left + this.$refs[y.time][0].getBoundingClientRect().width / 2);
              })
              this.select.forEach((item, i) => {
                item.left = info.minColCenter + horizontalAverageDistance * i - this.$refs[this.select[i].time][0].getBoundingClientRect().width / 2;
              })
              break;
            case 'leftDistribute'://按左分布
              const leftAverageDistance = (info.maxleft - info.minleft) / (this.select.length - 1);//平均距离
              this.select = this.select.sort((x, y) => {
                return (x.left) - (y.left);
              })
              this.select.forEach((item, i) => {
                item.left = info.minleft + leftAverageDistance * i;
              })
              break;
            case 'rightDistribute'://按右分布
              const rightAverageDistance = (info.maxright - info.minright) / (this.select.length - 1);//平均距离
              this.select = this.select.sort((x, y) => {
                return (x.left + this.$refs[x.time][0].getBoundingClientRect().width) - (y.left + this.$refs[y.time][0].getBoundingClientRect().width);
              })
              this.select.forEach((item, i) => {
                item.left = info.minright + rightAverageDistance * i - this.$refs[this.select[i].time][0].getBoundingClientRect().width;
              })
              break;
            case 'topDistribute'://按顶分布
              const topAverageDistance = (info.maxtop - info.mintop) / (this.select.length - 1);//平均距离
              this.select = this.select.sort((x, y) => {
                return (x.top) - (y.top);
              })
              this.select.forEach((item, i) => {
                item.top = info.mintop + topAverageDistance * i;
              })
              break;
            case 'bottomDistribute'://按底分布
              const bottomAverageDistance = (info.maxbottom - info.minbottom) / (this.select.length - 1);//平均距离
              this.select = this.select.sort((x, y) => {
                return (x.top + this.$refs[x.time][0].getBoundingClientRect().height) - (y.top + this.$refs[y.time][0].getBoundingClientRect().height);
              })
              this.select.forEach((item, i) => {
                item.top = info.minbottom + bottomAverageDistance * i - this.$refs[this.select[i].time][0].getBoundingClientRect().height;
              })
              break;
          }
        }

      },

    },
    components: {
      rulerTool
    },
    watch: {
      canvas: {
        handler: _.debounce(function (val, oldval) {
          if (!this.back) {
            const newval = JSON.parse(JSON.stringify(val))
            if (this.$store.state.history.length > 150) {
              this.$store.state.history.shift()
            }
            this.$store.state.history.push(newval)
          }
        }, 100),
        deep: true//对象内部的属性监听，也叫深度监听
      },
      initCanvas: function(val,oldval) {
        this.canvas = val;
      }
    }
  }
</script>
<style scoped lang="scss">
  @import '../assets/css/mixin';

  .template-editor {
    height: 100%;
    width: 100%;
    user-select: none;
    display: flex;
    flex-direction: column;
    background-color: #A0A0A0;
    flex: 1;
    .edit-btns {
      box-sizing: border-box;
      padding: 10px 20px;
      background-color: #2f2f2c;
      .create-btn-wrap {
        margin-right: auto;
        .create-btn {
          margin-right: 30px;

        }
      }

    }
    .pannel-block-align {
      margin-right: auto;
      margin-left: -15%;
      @include fj(flex-start);
      .block {
        border-left: 1px solid #222;
        border-right: 1px solid #666;
        @include fj(flex-start);
        &.active {
          .label {
            cursor: pointer;
            i {
              color: #ccc;
            }
            &:hover {
              i {
                color: #fff;
              }
            }
          }
        }
        .label {
          @include wh(16px, 16px);
          position: relative;
          border: solid #2f2f2c 7px;
          i {
            @include center();
            @include sc(16px, #777);
          }
        }
      }
    }
    .edit-content {
      flex: 1;
      display: flex;
      .edit-info {
        overflow: auto;
        position: relative;
        flex: 1;
        .edit-canvas {
          position: relative;
          &.active:before {
            content: '';
            width: 100%;
            position: absolute;
            height: 100%;
            border: 1px dashed #0091ea;
          }
          .item {
            position: absolute;
            word-break: keep-all;
            white-space: nowrap;
            &.active:before {
              content: '';
              width: 100%;
              position: absolute;
              height: 100%;
              border: 1px dashed #0091ea;
              left: -2px;
            }
          }
        }

      }
    }

  }

  .edit-pannel {

    width: 175px;
    background: #3f3f3c;
    padding: 10px 0px 10px 10px;
    box-sizing: border-box;
    overflow-y: auto;
    .block-tit {
      color: #fff;
      font-size: 13px;
      padding-bottom: 5px;
    }
    .block {
      display: flex;
      flex-wrap: wrap;
      .label {
        background: #4f4f4c;
        border-radius: 3px;
        -webkit-font-smoothing: antialiased;
        width: 70px;
        height: 70px;
        position: relative;
        margin: 0 5px 5px 0;
        overflow: hidden;
        &.input, &.small-input {
          width: 145px;
          input {
            box-sizing: border-box;
            height: 24px;
            border: none;
            background-color: transparent;
            width: 145px;
            padding: 0 10px;
            color: #fff;
          }

        }
        &.small-input {
          width: 70px;
          input {
            width: 70px;
          }
        }
        .info {
          padding: 30px 0 16px;
          text-align: center;
          color: #0091ea;
          font-size: 24px;
        }
        span {
          font: 11px/130% sans-serif;
          color: #ccc;
          display: block;
          position: absolute;
          top: 5px;
          left: 5px;
          text-align: left;
        }
      }
    }
    .pannel-block-align {
      .block {
        .label {
          @include wh(22px, 22px);
          margin: 0 3px 3px 0;
          position: relative;
          border: solid #4f4f4c 12px;
          cursor: pointer;
          &:hover {
            i {
              color: #fff;
            }
          }
          i {
            @include center();
            @include sc(22px, #ddd);
          }
        }
      }
    }

  }

  .g-table {
    border-style: solid;
    .g-tHead, .g-line-box {
      border-width: 0;
      border-style: solid;
      text-align: center;
      .g-column {
        border-style: solid;
        border-width: 0;
        &:last-child {
          border-right: 0 none !important;
        }
      }
    }
    .g-line-box {
      overflow: hidden;
      overflow-y: auto;
      .g-line {
        border-width: 0;
        border-style: solid;
        text-align: center;
        &:last-child {
          border-bottom: 0 none !important;
        }
      }
    }
  }
</style>
