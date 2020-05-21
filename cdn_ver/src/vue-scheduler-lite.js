/**
 * vue-scheduler-lite
 * 
 * A support drag and drop scheduler on vue.js
 * 
 * @date   2020/04/18
 * @author Lin Masahiro(k80092@hotmail.com)
 * @see https://github.com/linmasahiro/vue-scheduler-lite
 * 
 * (c) 2020 Lin masahiro
 * Released under the MIT License.
 */




const unitDiv = {
    props: {
        rowIndex: Number,
        keyIndex: Number,
        width: String,
        rowData: Object,
        isBusiness: Boolean,
        isSelecting: Boolean,
        isSelectingRowIndex: Number
    },
    data: function () {
        return {}
    },
    methods: {
        mousedown() {
            if (!this.isBusiness) {
                return false
            }
            this.$emit('mouse-down', this.rowIndex, this.keyIndex)
        },
        mouseenter() {
            if (!this.isSelecting || this.rowIndex != this.isSelectingRowIndex || !this.isBusiness) {
                return false
            }
            this.$emit('mouse-enter', this.keyIndex)
        },
        mouseup() {
            this.$emit('mouse-up')
        },
        setDragenterRowAndIndex() {
            if (!this.isBusiness) {
                return false
            }
            this.$emit('set-dragenter-row-and-index', this.rowIndex, this.keyIndex)
        }
    },
    template: `
        <div 
          :class="['tl', isBusiness ? 'can-res' : 'cant-res']"
          :style="{width: width}"
          @mousedown="mousedown"
          @mouseenter="mouseenter"
          @mouseup="mouseup"
          @dragenter="setDragenterRowAndIndex"
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
        maxDate: String,
        unit: Number,
        clearSwitch: Boolean,
        dragenterRowIndex: Number,
        dragenterKeyIndex: Number,
        isSelecting: Boolean,
        isSelectingRowIndex: Number,
        isSelectingIndex: Number
    },
    data: function () {
        return {
            styleObject: {
                "Opacity": 1,
                "left": "0px",
                "width": "0px",
                "height": "130px"
            },
            isShow: false,
            mouseXStarted: null,
            startLineNo: null,
            endLineNo: null,
            isMe: false,
            isEdit: false,
            isMove: false
        }
    },
    created() {
        if ((new Date(this.startText) - new Date(this.minDate)) < 0 && (new Date(this.endText) - new Date(this.minDate)) < 0) {
            return
        }
        this.setLeftPosition()
        this.setWidth()
        this.isShow = true
    },
    watch: {
        startText(newVal, oldVal) {
            if (newVal != oldVal) {
                this.startDate = newVal
                this.setLeftPosition()
            }
        },
        endText(newVal, oldVal) {
            if (newVal != oldVal) {
                this.endDate = newVal
                this.setWidth()
                if (this.isSelecting &&
                    this.mouseXStarted &&
                    this.rowIndex == this.isSelectingRowIndex &&
                    this.keyNo == this.isSelectingIndex
                ) {
                    let diff = this.getMinutesDiff(new Date(oldVal), new Date(newVal))
                    let cnt = parseInt(diff / this.unit)
                    this.mouseXStarted += this.unitWidth * cnt
                }
            }
        },
        dragenterKeyIndex(newVal, oldVal) {
            if (newVal != oldVal && this.dragenterRowIndex == this.rowIndex && this.isEdit) {
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
            if (this.isSelecting) {
                e.preventDefault()
                return
            }
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
            if (this.isSelecting) {
                e.preventDefault()
                return
            }
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
            if (this.isEdit) {
                this.$emit('edit-event', this.startText, this.endText)
            }
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
            if (this.isSelecting) {
                e.preventDefault()
                return
            }
            if (!this.isEdit) {
                this.styleObject.Opacity = 0.5
                this.isMove = true
                this.mouseXStarted = e.clientX
                this.$emit('set-dragenter-row-and-index', this.rowIndex, null)
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
         * Mouse move event for Add new schedule
         */
        mousemove(e) {
            if (
                this.rowIndex == this.isSelectingRowIndex &&
                this.keyNo == this.isSelectingIndex
            ) {
                if (this.isSelecting && this.mouseXStarted) {
                    let movePx = e.clientX - this.mouseXStarted
                    let unitCnt = parseInt(movePx / this.unitWidth)
                    if (unitCnt != 0 && unitCnt < 0) {
                        this.mouseXStarted = e.clientX + this.unitWidth
                        this.$emit("edit-schedule-data", this.rowIndex, this.keyNo, unitCnt)
                    }
                }
                if (this.isSelecting && !this.mouseXStarted) {
                    this.mouseXStarted = e.clientX
                    this.styleObject.Opacity = 0.5
                }
            }
        },
        /**
         * Mouse up event for Add new schedule
         */
        mouseup() {
            this.$emit('mouse-up', this.startText, this.endText)
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
            const diffTime = date2 - date1;
            return Math.ceil(diffTime / (1000 * 60));
        }
    },
    template: `
        <div 
          v-if="isShow"
          :class="['sc-bar', isMe ? 'isMe' : 'notMe']"
          :style="styleObject"
          :draggable="'true'"
          @dragstart="moveStart"
          @dragend="moveEnd"
          @dragover="editting($event)"
          @mouseup="mouseup"
          @mousemove="mousemove"
          @click="$emit('click-event')"
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

const vueSc = {
    components: {
        'unit-div': unitDiv,
        'reserved-div': reservedDiv
    },
    props: {
        scheduleData: Array,
        setting: Object,
    },
    data() {
        return {
            settingData: {
                startDate: '2020/04/20',
                endDate: '2020/04/26',
                weekdayText: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
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
            isSelectingRowIndex: null,
            isSelectingIndex: null,
            dragenterRowIndex: null,
            dragenterKeyIndex: null,
            clearSwitch: false
        }
    },
    created() {
        this.settingData = Object.assign(this.settingData, this.setting);
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
        setDragenterRow(rowIndex) {
            this.dragenterRowIndex = rowIndex
        },
        /**
         * Draggable Enter Event
         * 
         * @param int rowIndex     Row Index
         * @param int currentIndex Current Index
         * 
         * @returns void 
         */
        setDragenterRowAndIndex(rowIndex, currentIndex) {
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
         * Check this range is business or not
         * 
         * @param Int    rowIndex      Row index
         * @param String startDateText StartDate text
         * @param String endDateText   EndDate text
         * 
         * @returns Boolean
         */
        isBusinessOnRange(rowIndex, startDateText, endDateText) {
            let startDiff = this.getMinutesDiff(new Date(this.settingData.startDate), new Date(startDateText))
            let startCnt = parseInt(startDiff / this.settingData.unit)
            let endDiff = this.getMinutesDiff(new Date(this.settingData.startDate), new Date(endDateText))
            let endCnt = parseInt(endDiff / this.settingData.unit)
            let result = true
            for (var i = startCnt; i < endCnt; i++) {
                if (!this.isBusiness(rowIndex, i)) {
                    result = false
                }
            }
            return result
        },
        /**
         * Check this range has other event
         *
         * @param Int    index         Data index
         * @param Int    oldRowIndex   Old row index
         * @param Int    newRowIndex   New row index
         * @param String startDateText StartDate text
         * @param String endDateText   EndDate text
         *
         * @returns Boolean
         */
        hasOtherEvent(index, oldRowIndex, newRowIndex, startDateText, endDateText) {
            for (var n = 0; n < this.scheduleData[newRowIndex].schedule.length; n++) {
                if (n != index || oldRowIndex != newRowIndex) {
                    let diffData = this.scheduleData[newRowIndex].schedule[n];
                    if (
                        new Date(diffData.start) - new Date(startDateText) >= 0 &&
                        new Date(diffData.end) - new Date(endDateText) <= 0
                    ) {
                        return true;
                    }
                    if (
                        new Date(diffData.start) - new Date(startDateText) >= 0 &&
                        new Date(diffData.start) - new Date(endDateText) < 0
                    ) {
                        return true;
                    }
                    if (
                        new Date(diffData.start) - new Date(startDateText) <= 0 &&
                        new Date(diffData.end) - new Date(startDateText) > 0
                    ) {
                        return true;
                    }
                }
            }
            return false;
        },
        /**
         * The column are click start event
         * 
         * @param Object e Event
         * 
         * @returns void 
         */
        selectStartTime(rowIndex, keyIndex) {
            this.isSelecting = true
            this.isSelectingRowIndex = rowIndex
            let addMinutes = (keyIndex - 1) * this.settingData.unit
            let addMinutes2 = keyIndex * this.settingData.unit
            let newStartDateObj = this.addMinutes(new Date(this.settingData.startDate), addMinutes)
            let newEndDateObj = this.addMinutes(new Date(this.settingData.startDate), addMinutes2)
            this.scheduleData[rowIndex].schedule.push({
                text: 'New',
                start: this.datetimeFormatter(newStartDateObj),
                end: this.datetimeFormatter(newEndDateObj)
            })
            this.isSelectingIndex = (this.scheduleData[this.isSelectingRowIndex].schedule.length - 1)
        },
        /**
         * New event adjust event
         * 
         * @param int keyIndex 
         */
        adjustTimeRange(keyIndex) {
            let targetIndex =
                this.scheduleData[this.isSelectingRowIndex].schedule.length - 1;
            let targetData = this.scheduleData[this.isSelectingRowIndex].schedule[
                targetIndex
            ];
            if (targetData) {
                let addMinutes = keyIndex * this.settingData.unit;
                let newEndDateObj = this.addMinutes(
                    new Date(this.settingData.startDate),
                    addMinutes
                );
                let newEndDateText = this.datetimeFormatter(newEndDateObj);
                let isPermission = true;

                // Check other event
                if (
                    this.hasOtherEvent(
                        targetIndex,
                        this.isSelectingRowIndex,
                        this.isSelectingRowIndex,
                        targetData.start,
                        newEndDateText
                    )
                ) {
                    isPermission = false;
                }

                // Check Businessday
                if (isPermission) {
                    isPermission = this.isBusinessOnRange(
                        this.isSelectingRowIndex,
                        targetData.start,
                        newEndDateText
                    );
                }
                if (isPermission) {
                    targetData.end = newEndDateText;
                }
            }
        },
        /**
         * Add new block event
         * 
         * @param Boolean isAdd     Is add event action
         * @param String  startDate StartDate text
         * @param String  endDate   EndDate text
         * 
         * @returns void 
         */
        selectEndTime(startDate, endDate) {
            if (this.isSelecting) {
                if (startDate == undefined) {
                    let targetData = this.scheduleData[this.isSelectingRowIndex].schedule[this.scheduleData[this.isSelectingRowIndex].schedule.length - 1]
                    startDate = targetData.start
                    endDate = targetData.end
                }
                this.$emit('add-event', this.isSelectingRowIndex, startDate, endDate)
            }
            this.isSelecting = false
            this.isSelectingRowIndex = null
            this.isSelectingIndex = null
            this.clearSwitch = !this.clearSwitch
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
            let targetData = this.scheduleData[rowIndex].schedule[keyNo];
            if (targetData) {
                let status = 0;
                let isBusinessFlag = true;
                let isBusinessChecked = false;
                let changeDatetimeText = datetimeText => {
                    let addMinutes = unitCnt * this.settingData.unit;
                    let dateObj = new Date(datetimeText);
                    let newDateObj = this.addMinutes(dateObj, addMinutes);
                    return this.datetimeFormatter(newDateObj);
                };
                let newStartDatetime = changeDatetimeText(targetData.start);
                let newEndDatetime = changeDatetimeText(targetData.end);

                if (unitCnt != 0) {
                    if (
                        this.hasOtherEvent(
                            keyNo,
                            rowIndex,
                            this.dragenterRowIndex,
                            newStartDatetime,
                            newEndDatetime
                        )
                    ) {
                        status = 2;
                    } else {
                        isBusinessFlag = this.isBusinessOnRange(
                            this.dragenterRowIndex,
                            newStartDatetime,
                            newEndDatetime
                        );
                        if (isBusinessFlag) {
                            targetData.start = newStartDatetime;
                            targetData.end = newEndDatetime;
                            status = 1;
                        }
                        isBusinessChecked = true;
                    }
                }
                if (
                    rowIndex != this.dragenterRowIndex &&
                    this.scheduleData[this.dragenterRowIndex]
                ) {
                    if (isBusinessChecked && !isBusinessFlag) {
                        this.$emit("move-event", status);
                        return;
                    }
                    if (!isBusinessChecked && isBusinessFlag) {
                        if (
                            this.hasOtherEvent(
                                keyNo,
                                rowIndex,
                                this.dragenterRowIndex,
                                newStartDatetime,
                                newEndDatetime
                            )
                        ) {
                            status = 2;
                            this.$emit("move-event", status);
                            return;
                        }
                        isBusinessFlag = this.isBusinessOnRange(
                            this.dragenterRowIndex,
                            targetData.start,
                            targetData.end
                        );
                        isBusinessChecked = true;
                    }
                    if (isBusinessChecked && isBusinessFlag) {
                        this.scheduleData[this.dragenterRowIndex].schedule.push(targetData);
                        this.scheduleData[rowIndex].schedule.splice(keyNo, 1);
                        status = 1;
                    }
                }
                this.$emit("move-event", status, targetData.start, targetData.end);
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
                if (new Date(newEndText) - new Date(targetData.start) < 0) {
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
            this.$emit('delete-event', rowIndex, keyNo)
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
        class="schedule"
        @dragover="disableDragendAnimation"
      >
        <div>
          <div
            class="sc-rows"
            :style="{width: settingData.titleDivW + '%', height: contentH + 'px'}"
          >
            <div
              class="sc-rows-scroll"
              :style="{width: '100%'}"
            >
              <div 
                v-for="(row, index) in scheduleData"
                :key="index" 
                :class="'timeline title'"
                :style="{'height': settingData.rowH + 'px', 'padding-top': (index == 0) ? padding + 'px' : '0px'}"
                @click="$emit('row-click-event', index, row.title)"
              >
                <span style="cursor: pointer;">{{ row.title }}</span>
              </div>
            </div>
          </div>
          <div class="sc-main-box" :style="{width: (100 - settingData.titleDivW) + '%'}">
            <div
              class="sc-main-scroll"
              :style="{width: contentW + 'px'}"
            >
              <div class="sc-main">
                <div
                  class="timeline"
                  :style="{height: settingData.dateDivH + 'px', background: 'black'}"
                >
                  <div
                    v-for="n in dateCnt"
                    :key="n"
                    class="sc-time"
                    :style="{width: dateDivW + 'px', cursor: 'pointer'}"
                    @click="$emit('date-click-event', getHeaderDate(n-1))"
                  >
                    {{ getHeaderDate(n-1) }}
                  </div>
                </div>
                <div
                  class="timeline"
                  :style="{height: settingData.timeDivH + 'px', background: '#6187AE'}"
                >
                  <div 
                    v-for="n in (dateCnt * 24)"
                    :key="n"
                    class="sc-time"
                    :style="{width: timeDivW + 'px'}"
                  >
                    {{ getHeaderTime(n - 1) }}
                  </div>
                </div>
                <div 
                  v-for="(row, index) in scheduleData" 
                  :key="index"
                  :class="'timeline'"
                  :style="{'height': settingData.rowH + 'px'}"
                  @dragenter="setDragenterRow(index)"
                >
                  <unit-div 
                    v-for="n in unitCnt"
                    :key="'unit' + n"
                    :row-index="index"
                    :key-index="n"
                    :row-data="row"
                    :is-business="isBusiness(index, (n - 1))"
                    :is-selecting="isSelecting"
                    :is-selecting-row-index="isSelectingRowIndex"
                    :width="settingData.unitDivW + 'px'"
                    @mouse-down="selectStartTime"
                    @mouse-enter="adjustTimeRange"
                    @mouse-up="selectEndTime"
                    @set-dragenter-row-and-index="setDragenterRowAndIndex"
                  ></unit-div>
                  <reserved-div 
                    v-for="(detail, keyNo) in row.schedule"
                    :key="'res' + keyNo"
                    :schedule-detail="detail"
                    :row-index="index"
                    :key-no="keyNo"
                    :start-text="detail.start"
                    :end-text="detail.end"
                    :content-text="detail.text"
                    :unit-width="settingData.unitDivW"
                    :unit-height="settingData.rowH"
                    :title-div-width="settingData.titleDivW"
                    :border-width="settingData.borderW"
                    :min-date="settingData.startDate"
                    :max-date="settingData.endDate"
                    :unit="settingData.unit"
                    :clear-switch="clearSwitch"
                    :dragenter-row-index="dragenterRowIndex"
                    :dragenter-key-index="dragenterKeyIndex"
                    :is-selecting="isSelecting"
                    :is-selecting-row-index="isSelectingRowIndex"
                    :is-selecting-index="isSelectingIndex"
                    @set-dragenter-row-and-index="setDragenterRowAndIndex"
                    @move-schedule-data="moveScheduleData"
                    @edit-schedule-data="editScheduleData"
                    @delete-schedule-data="deleteScheduleData"
                    @mouse-up="selectEndTime"
                    @move-event="$emit('move-event')"
                    @edit-event="$emit('edit-event', detail.start, detail.end)"
                    @click-event="$emit('click-event', detail.start, detail.end, detail.text, detail.data)"
                  ></reserved-div>
                </div>
              </div>
            </div>
          </div>
          <br class="clear">
        </div>
      </div>
    `
}