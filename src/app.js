/**
 * vue-scheduler
 * 
 * A support drag and drop scheduler on vue.js
 * 
 * @date   2020/04/18
 * @author Lin Masahiro(k80092@hotmail.com)
 * @see https://github.com/linmasahiro/vue-scheduler
 */


const sampleData = [{
        title: 'Room１',
        noBusinessDate: [
            '2020/04/20'
        ],
        businessHours: [{
                start: '00:00',
                end: '24:00'
            },
            {
                start: '00:00',
                end: '24:00'
            },
            {
                start: '00:00',
                end: '24:00'
            },
            {
                start: '00:00',
                end: '24:00'
            },
            {
                start: '00:00',
                end: '24:00'
            },
            {
                start: '00:00',
                end: '24:00'
            },
            {
                start: '00:00',
                end: '24:00'
            },
        ],
        schedule: [{
                text: 'Mr.A reserved',
                start: '2020/04/20 06:00',
                end: '2020/04/21 01:00',
                data: {
                    something: 'something'
                }
            },
            {
                text: 'Mr.B reserved',
                start: '2020/04/21 06:00',
                end: '2020/04/21 12:00',
                data: {
                    something: 'something'
                }
            }
        ]
    },
    {
        title: 'Room２',
        noBusinessDate: [],
        businessHours: [{
                start: '10:00',
                end: '17:00'
            },
            {
                start: '10:00',
                end: '17:00'
            },
            {
                start: '10:00',
                end: '17:00'
            },
            {
                start: '10:00',
                end: '17:00'
            },
            {
                start: '10:00',
                end: '17:00'
            },
            {
                start: '10:00',
                end: '17:00'
            },
            {
                start: '10:00',
                end: '17:00'
            },
        ],
        schedule: [{
            text: 'Mr.C reserved',
            start: '2020/04/20 12:00',
            end: '2020/04/20 17:00',
            data: {
                something: 'something'
            }
        }]
    },
    {
        title: 'Room３',
        noBusinessDate: [],
        businessHours: [{
                start: '00:00',
                end: '24:00'
            },
            {
                start: '00:00',
                end: '24:00'
            },
            {
                start: '00:00',
                end: '24:00'
            },
            {
                start: '00:00',
                end: '24:00'
            },
            {
                start: '00:00',
                end: '24:00'
            },
            {
                start: '00:00',
                end: '24:00'
            },
            {
                start: '00:00',
                end: '24:00'
            },
        ],
        schedule: [{
            text: 'Mr.D reserved',
            start: '2020/04/20 12:00',
            end: '2020/04/20 18:00',
            data: {
                something: 'something'
            }
        }]
    }
];

const unitDiv = {
    props: {
        rowIndex: Number,
        keyIndex: Number,
        width: String,
        rowData: Object,
        isBusiness: Boolean
    },
    data: function () {
        return {}
    },
    methods: {
        mousedown(e) {
            if (!this.isBusiness) {
                return false
            }
            this.$emit('mouse-down', e)
        },
        mousemove(e) {
            if (!this.isBusiness) {
                return false
            }
            this.$emit('mouse-move', e)
        },
        mouseup(e) {
            if (!this.isBusiness) {
                return false
            }
            this.$emit('mouse-up', e)
        },
        setDragenterRow() {
            this.$emit('set-dragenter-row', this.rowIndex, this.keyIndex)
        }
    },
    template: `
        <div 
          :class="['tl', isBusiness ? 'can-res' : 'cant-res']"
          :style="{width: width}"
          @mousedown="mousedown"
          @mousemove="mousemove"
          @mouseup="mouseup"
          @dragenter="setDragenterRow"
        >
        </div>
    `
}

const reservedDiv = {
    props: {
        rowIndex: Number,
        keyNo: Number,
        unitWidth: Number,
        unitHeight: Number,
        titleDivWidth: Number,
        borderWidth: Number,
        startText: String,
        endText: String,
        contentText: String,
        minDate: String,
        unit: Number,
        clearSwitch: Boolean,
        dragenterRowIndex: Number,
        dragenterKeyIndex: Number
    },
    data: function () {
        return {
            styleObject: {
                "Opacity": 1,
                "left": "0px",
                "width": "0px",
                "height": "130px"
            },
            mouseXStarted: null,
            startLineNo: null,
            endLineNo: null,
            isMe: false,
            isEdit: false,
            isMove: false
        }
    },
    created() {
        this.setLeftPosition()
        this.setWidth()
    },
    watch: {
        startText(newVal, oldVal) {
            if (newVal != oldVal) {
                this.setLeftPosition()
            }
        },
        endText(newVal, oldVal) {
            if (newVal != oldVal) {
                this.setWidth()
            }
        },
        dragenterKeyIndex(newVal, oldVal) {
            if (newVal != oldVal && this.isEdit) {
                this.editting()
            }
        },
        clearSwitch(newVal, oldVal) {
            if (newVal != oldVal) {
                this.editEnd()
            }
        }
    },
    methods: {
        /**
         * Set the Block left pixel
         * 
         * @returns void
         */
        setLeftPosition() {
            let leftDiff = this.getMinutesDiff(new Date(this.minDate), new Date(this.startText))
            let shiftCnt = parseInt(leftDiff / this.unit)
            this.startLineNo = shiftCnt
            let shiftLeft = this.unitWidth * shiftCnt + (shiftCnt * this.borderWidth)
            this.styleObject.left = shiftLeft + "px"
        },
        /**
         * Set the Block width pixel
         * 
         * @returns void
         */
        setWidth() {
            let rightDiff = this.getMinutesDiff(new Date(this.startText), new Date(this.endText))
            let widthCnt = parseInt(rightDiff / this.unit)
            this.endLineNo = this.startLineNo + widthCnt
            let width = this.unitWidth * widthCnt + (widthCnt * this.borderWidth)
            this.styleObject.width = width + "px"
        },
        /**
         * Set the Block to edit status
         * 
         * @param Object e Event 
         * 
         * @returns void
         */
        editStart(e) {
            this.isEdit = true
            this.mouseXStarted = e.clientX
            this.styleObject.Opacity = 0.5
        },
        /**
         * Adjust time event
         * 
         * @param Obejct e Event
         * 
         * @returns void
         */
        editting(e) {
            if (this.isEdit) {
                if (e) {
                    // adjust by Mouse X-axio
                    let movePx = e.clientX - this.mouseXStarted
                    let unitCnt = parseInt(movePx / this.unitWidth)
                    if (unitCnt != 0) {
                        this.mouseXStarted = e.clientX
                        this.$emit("edit-schedule-data", this.rowIndex, this.keyNo, unitCnt)
                    }
                } else {
                    // adjust by current unit-div number
                    if (this.dragenterKeyIndex > this.startLineNo) {
                        this.mouseXStarted += this.unitWidth
                        let unitCnt = parseInt(this.dragenterKeyIndex - this.endLineNo)
                        this.$emit("edit-schedule-data", this.rowIndex, this.keyNo, unitCnt)
                    }

                }
            }
        },
        /**
         * End edit and set new data
         * 
         * @returns void
         */
        editEnd() {
            this.isEdit = false
            this.styleObject.Opacity = 1
            this.mouseXStarted = null
        },
        /**
         * Set the block to move status
         * 
         * @param Object e 
         */
        moveStart(e) {
            if (!this.isEdit) {
                this.styleObject.Opacity = 0.5
                this.isMove = true
                this.mouseXStarted = e.clientX
            }
        },
        /**
         * End move and set new data
         * 
         * @returns void
         */
        moveEnd(e) {
            let mouseXEnd = e.clientX
            // Check move status and move block
            if (this.isMove && (mouseXEnd != this.mouseXStarted || this.dragenterRowIndex != this.rowIndex)) {
                // get x-axis moved count
                let moveXPx = mouseXEnd - this.mouseXStarted
                let unitCnt = parseInt(moveXPx / this.unitWidth)
                let halfWidth = parseInt(this.unitWidth / 2)
                let modXPx = parseInt(moveXPx % this.unitWidth)
                if (moveXPx < 0 && Math.abs(modXPx) >= halfWidth) {
                    unitCnt--
                }
                this.mouseXStarted = null

                if (unitCnt != 0 || this.dragenterRowIndex != this.rowIndex) {
                    // result pass to father component's method
                    this.$emit("move-schedule-data", this.rowIndex, this.keyNo, unitCnt)
                }
            }

            // Return block all status and opacity
            this.isEdit = false
            this.isMove = false
            this.styleObject.Opacity = 1
        },
        /**
         * Delete this event
         */
        deleteEvent() {
            this.$emit("delete-schedule-data", this.rowIndex, this.keyNo)
        },
        /**
         * Get minutes diff between date1 and date2
         * 
         * @param Object date1 DateObject1
         * @param Object date2 DateObject2
         * 
         * @returns Int
         */
        getMinutesDiff(date1, date2) {
            const diffTime = Math.abs(date2 - date1);
            return Math.ceil(diffTime / (1000 * 60));
        }
    },
    template: `
        <div 
          :class="['sc-bar', isMe ? 'isMe' : 'notMe']"
          :style="styleObject"
          :draggable="'true'"
          @dragstart="moveStart"
          @dragend="moveEnd"
          @dragover="editting($event)"
        >
          <span style="float: right; padding: 5px" @click="deleteEvent">✖</span><span class="head">
              <span class="startTime time">{{ startText }}</span>～<span class="endTime time">{{ endText }}</span>
          </span>
          <span class="text">{{ contentText }}</span>
          <div
            class="resizable-e"
            :draggable="'true'"
            @dragstart="editStart"
            @dragend="editEnd"
          ></div>
        </div>
    `
}

new Vue({
    el: '#app',
    components: {
        'unit-div': unitDiv,
        'reserved-div': reservedDiv
    },
    data() {
        return {
            scheduleData: sampleData,
            settingData: {
                startDate: '2020/04/20',
                endDate: '2020/04/26',
                weekdayText : [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ],
                unit: 60,
                borderW: 1,
                dateDivH: 25,
                timeDivH: 25,
                unitDivW: 25,
                titleDivW: 200,
                rowH: 135,
            },
            padding: 0,
            timeDivW: 0,
            dateDivW: 0,
            contentH: 0,
            contentW: 0,
            dateCnt: 0,
            unitCnt: 0,
            isSelecting: false,
            newStartTimeDivLeft: null,
            newStartTimeDivWidth: null,
            dragenterRowIndex: null,
            dragenterKeyIndex: null,
            clearSwitch: false
        }
    },
    created() {
        this.dateCnt = this.getDateDiff(new Date(this.settingData.startDate), new Date(this.settingData.endDate)) + 1
        let oneDayCnt = parseInt(1440 / this.settingData.unit)
        this.unitCnt = oneDayCnt * this.dateCnt
        this.padding = this.settingData.dateDivH + this.settingData.timeDivH + (this.settingData.borderW * 4)
        this.dateDivW = this.settingData.unitDivW * oneDayCnt + (oneDayCnt - this.settingData.borderW)
        this.contentH = this.padding + ((this.settingData.rowH + this.settingData.borderW * 2) * this.scheduleData.length)
        this.contentW = this.dateDivW * this.dateCnt + (this.dateCnt * this.settingData.borderW)
        this.timeDivW = 60 / this.settingData.unit * (this.settingData.unitDivW + this.settingData.borderW) - 1
    },
    methods: {
        /**
         * Draggable Enter Event
         * 
         * @param int rowIndex Row Index
         * 
         * @returns void 
         */
        setDragenterRow(rowIndex, currentIndex) {
            this.dragenterRowIndex = rowIndex
            this.dragenterKeyIndex = currentIndex
        },
        /**
         * Disable HTML5 DragEnd animation and Set mouse position
         * 
         * @param Obejct e Event
         */
        disableDragendAnimation(e) {
            e.preventDefault();
        },
        /**
         * Get header area date-text
         * 
         * @param Int n Col index 
         * 
         * @returns String
         */
        getHeaderDate(n) {
            let startDate = this.addDays(new Date(this.settingData.startDate), n)
            return this.dateFormatter(startDate, true)
        },
        /**
         * Get header area time-text
         * 
         * @param {*} n Col index
         */
        getHeaderTime(n) {
            return n % 24
        },
        /**
         * Get diff day between date1 and date2
         * 
         * @param Object date1 DateObejct1
         * @param Object date2 DateObejct2
         * 
         * @returns Int
         */
        getDateDiff(date1, date2) {
            const diffTime = Math.abs(date2 - date1);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        },
        /**
         * Custom date formatter
         * 
         * @param Obejct  dateObj     DateObejct 
         * @param Boolean withWeekDay If u need weekday, set True
         * 
         * @returns String
         */
        dateFormatter(dateObj, withWeekDay) {
            let year = dateObj.getFullYear()
            let month = dateObj.getMonth() + 1
            if (month < 10) {
                month = '0' + month
            }
            let date = dateObj.getDate()
            if (withWeekDay) {
                let day = dateObj.getDay()
                let dayText = this.settingData.weekdayText[day]
                return year + '/' + month + '/' + date + '(' + dayText + ')'
            }
            return year + '/' + month + '/' + date
        },
        /**
         * Custom datetime formatter
         * 
         * @param Obejct  dateObj     DateObejct
         * 
         * @returns String
         */
        datetimeFormatter(dateObj) {
            let year = dateObj.getFullYear()
            let month = dateObj.getMonth() + 1
            if (month < 10) {
                month = '0' + month
            }
            let date = dateObj.getDate()
            let hours = dateObj.getHours()
            if (hours < 10) {
                hours = '0' + hours
            }
            let minutes = dateObj.getMinutes()
            if (minutes < 10) {
                minutes = '0' + minutes
            }
            return year + '/' + month + '/' + date + ' ' + hours + ':' + minutes
        },
        /**
         * Add days to object
         * 
         * @param Obejct dateObj DateObject 
         * @param Int    n       Add number
         * 
         * @returns Object 
         */
        addDays(dateObj, n) {
            dateObj.setTime(dateObj.getTime() + (n * 60 * 60 * 24 * 1000))
            return dateObj
        },
        /**
         * Add minutes to date object
         * 
         * @param Obejct dateObj DateObject 
         * @param Int    n       Add number
         * 
         * @returns Object 
         */
        addMinutes(dateObj, n) {
            dateObj.setTime(dateObj.getTime() + (n * 60 * 1000))
            return dateObj
        },
        /**
         * Check this div is business or not
         * 
         * @param Int rowIndex Row index
         * @param Int n        Col index
         * 
         * @returns Boolean
         */
        isBusiness: function (rowIndex, n) {
            // first check this div business day
            let startDate = new Date(this.settingData.startDate)
            let oneDayCnt = parseInt(1440 / this.settingData.unit)
            let thisDate = this.addDays(startDate, parseInt(n / oneDayCnt))
            let noBusinessDate = this.scheduleData[rowIndex].noBusinessDate
            if (noBusinessDate.indexOf(this.dateFormatter(thisDate)) >= 0) {
                // today not business day
                return false
            }

            // and check this div time bussiness hour
            let weekDay = thisDate.getDay()
            let businessHour = this.scheduleData[rowIndex].businessHours[weekDay]
            if (businessHour.start == '00:00' && businessHour.end == '24:00') {
                // alltime
                return true
            }

            // has bussiness hour
            let businessStartTime = businessHour.start.replace(":", "")
            let businessEndTime = businessHour.end.replace(":", "")
            let dateMod = n % oneDayCnt
            let divStartCnt = dateMod * this.settingData.unit
            let divStartHour = parseInt(divStartCnt / 60)
            if (divStartHour < 10) {
                divStartHour = "0" + divStartHour
            }
            let divStartMin = parseInt(divStartCnt % 60)
            if (divStartMin < 10) {
                divStartMin = "0" + divStartMin
            }
            let divStartTime = divStartHour + "" + divStartMin
            if (divStartTime >= businessStartTime && divStartTime < businessEndTime) {
                return true
            }
            return false
        },
        /**
         * The column are click start event
         * 
         * @param Object e Event
         * 
         * @returns void 
         */
        selectStartTime(e) {
            e.preventDefault();
            this.newStartTimeDivLeft = e.target.offsetLeft
            this.newStartTimeDivWidth = e.target.offsetWidth
            this.isSelecting = true
        },
        /**
         * Add new block and adjust range
         * 
         * @param Object e Event
         * 
         * @returns void 
         */
        adjustTimeRange(e) {
            if (this.isSelecting && e.target.offsetLeft >= (this.newStartTimeDivLeft + this.newStartTimeDivWidth)) {
                console.log(2)
            }
        },
        /**
         * Edit Schedule Datetime Text
         * 
         * @param int rowIndex     Row Index
         * @param int keyNo        Key
         * @param int unitCnt      Moved unit count
         * 
         * @returns void 
         */
        moveScheduleData(rowIndex, keyNo, unitCnt) {
            let targetData = this.scheduleData[rowIndex].schedule[keyNo]
            if (targetData) {
                if (unitCnt != 0) {
                    let changeDatetimeText = (datetimeText) => {
                        let addMinutes = unitCnt * this.settingData.unit
                        let dateObj = new Date(datetimeText)
                        let newDateObj = this.addMinutes(dateObj, addMinutes)
                        return this.datetimeFormatter(newDateObj)
                    }
                    targetData.start = changeDatetimeText(targetData.start)
                    targetData.end = changeDatetimeText(targetData.end)
                }
                if (rowIndex != this.dragenterRowIndex && this.scheduleData[this.dragenterRowIndex]) {
                    this.scheduleData[this.dragenterRowIndex].schedule.push(targetData)
                    this.scheduleData[rowIndex].schedule.splice(keyNo, 1)
                }
            }
        },
        /**
         * Edit Schedule Datetime Text
         * 
         * @param int rowIndex  Row
         * @param int keyNo     Key
         * @param int unitCnt   Moved unit count
         * 
         * @returns void 
         */
        editScheduleData(rowIndex, keyNo, unitCnt) {
            let targetData = this.scheduleData[rowIndex].schedule[keyNo]
            if (targetData) {
                let changeDatetimeText = (datetimeText) => {
                    let addMinutes = unitCnt * this.settingData.unit
                    let dateObj = new Date(datetimeText)
                    let newDateObj = this.addMinutes(dateObj, addMinutes)
                    return this.datetimeFormatter(newDateObj)
                }
                let newEndText = changeDatetimeText(targetData.end)
                if (targetData.start == newEndText) {
                    return false
                }
                targetData.end = newEndText
            }
        },
        /**
         * Delete Schedule
         * 
         * @param int rowIndex  Row
         * @param int keyNo     Key
         * 
         * @returns void 
         */
        deleteScheduleData(rowIndex, keyNo) {
            this.scheduleData[rowIndex].schedule.splice(keyNo, 1)
        },
        /**
         * Add new block event
         * 
         * @param Object e Event
         * 
         * @returns void 
         */
        selectEndTime(e) {
            console.log(3)
            this.isSelecting = false
            this.clearSwitch = !this.clearSwitch
        }
    }
})