import React from 'react';
import './Calendar.css';
import axios from 'axios';

class CalendarComponent extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            currentDate: new Date(),
            events: {},
        }

        this.incrementMonth = this.incrementMonth.bind(this);
        this.decrementMonth = this.decrementMonth.bind(this);
    }



    
    /**
     * Using this to compare today's date to the current cell's date.
     * If they are equal, than we return true.
     */
    isCurrentDate(cellDayNumber) {
        const today = new Date(); // Yes, today
        const year = today.getFullYear();
        const month = today.getMonth();
        const day = today.getDate();

        // Unfortunately, the Date above will also give me hour,minute,seconds
        // So I'm just going to recreate today's date without those additional things.
        const todayDate = new Date(year, month, day);

        const calendarYear = this.state.currentDate.getFullYear();
        const calendarMonth = this.state.currentDate.getMonth();
        

        const cellDate = new Date(calendarYear, calendarMonth, cellDayNumber);
        
        if(todayDate.getTime() === cellDate.getTime()) {
            return true;
        }

        return false;
    }

    incrementMonth() {
        const current = this.state.currentDate;
        const year = current.getFullYear();
        const month = current.getMonth();

        // If month is December, Javascript's Date object will
        // also update year!
        this.setState( {
            currentDate: new Date(year, month + 1, 1),
        });
    }

    decrementMonth() {
        const current = this.state.currentDate;
        const year = current.getFullYear();
        const month = current.getMonth();

        this.setState( {
            currentDate: new Date(year, month - 1, 1),
        });
    }

    render() {
        let calendar = [];

        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let monthIndex = this.state.currentDate.getMonth();



        // Full Date (Fri Sep 13 2019 16:52:45 GMT-0700 (Pacific Daylight Time))
        let firstDayDate = new Date(
                this.state.currentDate.getFullYear(), this.state.currentDate.getMonth(), 1);
        let lastDayDate = new Date(
            this.state.currentDate.getFullYear(), this.state.currentDate.getMonth() + 1, 0);
            


        // Number of rows calendar needs, in some cases there are 6.
        let weekCount = 5;
        if(firstDayDate.getDay() > 4 && lastDayDate.getDate() > 30) {
            weekCount++;
        }


        let dayCount = 1;
        for(let i = 0; i < weekCount; i++) {
            // This will be reset with every loop so we dont have to worry
            // about indices when adding these elements to "calendar"
            let rowCells = [];
            for(let j = 0; j < 7; j++) {
                // Should be 7
                if(i == 0 && firstDayDate.getDay() <= j) {
                    // Going to add conditional styling. If the cell
                    // is the current date, we will light it up
                    rowCells.push(
                        <div className={"cell" + (this.isCurrentDate(dayCount) ? ' today' : '')}>
                            <div className="day-number">{dayCount}</div>
                            <div className="event-button">Test</div>
                            
                        </div>);

                    dayCount++;
                } else if(i == (weekCount - 1) && lastDayDate.getDay() < j) {
                    // I think we can get rid of the two child divs, they kind of do nothing
                    rowCells.push(
                        <div className="cell">
                            
                            <div className="day-number"></div>
                            <div className="event-button">Test</div>
                            
                        </div>);
                } else if (i > 0) {
                    // Going to add conditional styling
                    // is the current date, we will light it up
                    rowCells.push(
                        <div className={"cell" + (this.isCurrentDate(dayCount) ? ' today' : '')}>
                            <div className="day-number">{dayCount}</div>
                            <div className="event-button">Test</div>
                            
                        </div>);

                    dayCount++;
                } else {
                    rowCells.push(
                        <div className="cell">
                            <div className="day-number"></div>
                            <div className="event-button">Test</div>
                        </div>);
                }
                
            }
            // The children will be added from inner for-loop
            calendar.push(<div className={"row-" + i}>{rowCells}</div>);
        }   

        return(
            <div>
                <button className="prev-button" onClick={this.decrementMonth}>Prev</button>
                <button onClick={this.incrementMonth}>Next</button>
                
                <div style={{color: 'white'}}>
                    {months[monthIndex]} {this.state.currentDate.getFullYear()}
                </div>
                
                <div className="day-header-container">
                    <div className="day-header">Sun</div>
                    <div className="day-header">Mon</div>
                    <div className="day-header">Tue</div>
                    <div className="day-header">Wed</div>
                    <div className="day-header">Thu</div>
                    <div className="day-header">Fri</div>
                    <div className="day-header">Sat</div>
                </div>
                
                {calendar}
            </div>
        );

    }
}

export default CalendarComponent;