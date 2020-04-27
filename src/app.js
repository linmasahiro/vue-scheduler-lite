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
                dow: ['0'],
                start: '00:00',
                end: '24:00'
            },
            {
                dow: ['1'],
                start: '00:00',
                end: '24:00'
            },
            {
                dow: ['2'],
                start: '00:00',
                end: '24:00'
            },
            {
                dow: ['3'],
                start: '00:00',
                end: '24:00'
            },
            {
                dow: ['4'],
                start: '00:00',
                end: '24:00'
            },
            {
                dow: ['5'],
                start: '00:00',
                end: '24:00'
            },
            {
                dow: ['6'],
                start: '00:00',
                end: '24:00'
            },
        ],
        schedule: [{
                text: 'Mr.A reserved',
                class: 'green',
                start: '2019/05/18 06:00',
                end: '2019/05/18 12:00',
                data: {
                    something: 'something'
                }
            },
            {
                text: 'Mr.B reserved',
                class: '',
                start: '2019/05/19 06:00',
                end: '2019/05/19 12:00',
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
                dow: ['0'],
                start: '10:00',
                end: '17:00'
            },
            {
                dow: ['1'],
                start: '10:00',
                end: '17:00'
            },
            {
                dow: ['2'],
                start: '10:00',
                end: '17:00'
            },
            {
                dow: ['3'],
                start: '10:00',
                end: '17:00'
            },
            {
                dow: ['4'],
                start: '10:00',
                end: '17:00'
            },
            {
                dow: ['5'],
                start: '10:00',
                end: '17:00'
            },
            {
                dow: ['6'],
                start: '10:00',
                end: '17:00'
            },
        ],
        schedule: [{
            text: 'Mr.C reserved',
            class: 'green',
            start: '2019/05/18 12:00',
            end: '2019/05/18 17:00',
            data: {
                something: 'something'
            }
        }]
    },
    {
        title: 'Room３',
        noBusinessDate: [],
        businessHours: [{
                dow: ['0'],
                start: '00:00',
                end: '24:00'
            },
            {
                dow: ['1'],
                start: '00:00',
                end: '24:00'
            },
            {
                dow: ['2'],
                start: '00:00',
                end: '24:00'
            },
            {
                dow: ['3'],
                start: '00:00',
                end: '24:00'
            },
            {
                dow: ['4'],
                start: '00:00',
                end: '24:00'
            },
            {
                dow: ['5'],
                start: '00:00',
                end: '24:00'
            },
            {
                dow: ['6'],
                start: '00:00',
                end: '24:00'
            },
        ],
        schedule: [{
            text: 'Mr.D reserved',
            class: 'green',
            start: '2019/05/17 12:00',
            end: '2019/05/17 18:00',
            data: {
                something: 'something'
            }
        }]
    }
];

Vue.component('unit-div', {
    props: {
        lineNo: Number,
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
        }
    },
    template: `
        <div 
          :class="['tl', isBusiness ? 'can-res' : 'cant-res']"
          :style="{width: width}"
          @mousedown="mousedown"
          @mousemove="mousemove"
          @mouseup="mouseup"
        >
        </div>
    `
})

new Vue({
    el: '#app',
    data() {
        return {
            scheduleData: sampleData,
            settingData: {
                startDate: '2020/04/20',
                endDate: '2020/04/23',
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
            newStartTimeDivWidth: null
        }
    },
    created() {
        this.dateCnt = this.dateDiff(new Date(this.settingData.startDate), new Date(this.settingData.endDate)) + 1
        let oneDayCnt = parseInt(1440 / this.settingData.unit)
        this.unitCnt = oneDayCnt * this.dateCnt
        this.padding = this.settingData.dateDivH + this.settingData.timeDivH + (this.settingData.borderW * 10)
        this.dateDivW = this.settingData.unitDivW * oneDayCnt + (oneDayCnt - this.settingData.borderW)
        this.contentH = this.padding + (this.settingData.rowH * 3)
        this.contentW = this.dateDivW * this.dateCnt + (this.dateCnt * this.settingData.borderW)
        this.timeDivW = 60 / this.settingData.unit * (this.settingData.unitDivW + this.settingData.borderW) - 1
    },
    methods: {
        getHeaderDate(n) {
            let startDate = this.addDays(new Date(this.settingData.startDate), n)
            return this.dateFormatter(startDate, true)
        },
        dateDiff(date1, date2) {
            const diffTime = Math.abs(date2 - date1);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        },
        dateFormatter(val, withWeekDay) {
            let year = val.getFullYear()
            let month = val.getMonth() + 1
            if (month < 10) {
                month = '0' + month
            }
            let date = val.getDate()
            if (withWeekDay) {
                let day = val.getDay()
                return year + '/' + month + '/' + date + '(' + day + ')'
            }
            return year + '/' + month + '/' + date
        },
        addDays(val, n) {
            let year = val.getFullYear()
            let month = val.getMonth()
            let date = val.getDate() + n
            return new Date(year, month, date)
        },
        getHeaderTime(n) {
            return n % 24
        },
        getUnitDiveDatetime(n) {
            return "2020/04/20 01:00"
        },
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
            let dateMod = n % oneDayCnt


            return true
        },
        selectStartTime(e) {
            e.preventDefault();
            this.newStartTimeDivLeft = e.target.offsetLeft
            this.newStartTimeDivWidth = e.target.offsetWidth
            this.isSelecting = true
        },
        adjustTimeRange(e) {
            if (this.isSelecting && e.target.offsetLeft >= (this.newStartTimeDivLeft + this.newStartTimeDivWidth)) {
                console.log(2)
            }
        },
        selectEndTime(e) {
            console.log(3)
            this.isSelecting = false
        }
    }
})