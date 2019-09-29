import React from 'react';
import './Calendar.css';
import axios from 'axios';
import key from './key';
// FOr some reason, adding this line fixes my issues with react-bootstrap (ask Emily)
import 'bootstrap/dist/css/bootstrap.css';

import EventModal from './EventModal';

/**
 * Note: -Google Calendar only return up to 2500 events.
 * 
 *       -Not all events have "description" or "location"
 *       -Maybe location or description can contain a link to the
 *        poster image or RSVP link.
 */

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
    
    componentDidMount() {        
        axios.get('https://www.googleapis.com/calendar/v3/calendars/m9es8vqqn5rqmrrnfr4g4s6adc@group.calendar.google.com/events?singleEvents=true&orderBy=startTime&timeMin=2019-01-01T10:00:00-07:00&key=' + key.API_KEY)
            .then(res => {
                const events = this.state.events; // Empty object at first

                /**
                 * This is how I'm storing my events. Yes, I know there's
                 * probably a better way to do this. It's 2:30am.
                 * 
                 * {
                 *      2019-01-01: {
                 *            events: [events]
                 *      },
                 *      2019-02-02 {
                 *            events: [events]
                 *      }
                 * }
                 */

                for(let i = 0; i < res.data.items.length; i++) {
                    let currentUTC = '';
                    let previousUTC = '';
                    
                    
                    
                    // This handles whether the json object has "dateTime" or "date"
                    if(res.data.items[i].start.hasOwnProperty("dateTime")) {
                        currentUTC = res.data.items[i].start.dateTime.slice(0, 10);
                    } else {
                        // Else it has start.date
                        currentUTC = res.data.items[i].start.date.slice(0, 10);
                    }

                    // Comparing currentUTC and previousUTC to see if the events
                    // belong to the same month.
                    if(i > 0) {
                        if(res.data.items[i - 1].start.hasOwnProperty("dateTime")) {
                            previousUTC = res.data.items[i - 1].start.dateTime.slice(0, 10);
                        } else {
                            previousUTC = res.data.items[i - 1].start.date.slice(0, 10);
                        }
                    }

   
                    // Compare, if the same, then we can simply push onto list
                    // if NOT the same, create!
                    if(currentUTC == previousUTC) {
                        events[currentUTC].push(res.data.items[i]);
                    } else {
                        events[currentUTC] = [res.data.items[i]];
                    }

                }


                this.setState({
                    events: events,
                });

            });
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

    getEvents(cellNumber) {
        const calendarYear = this.state.currentDate.getFullYear();
        const calendarMonth = this.state.currentDate.getMonth();
    
        const cellDate = new Date(calendarYear, calendarMonth, cellNumber);


        let yearString = (cellDate.getFullYear()).toString();
        let monthString = (cellDate.getMonth() + 1).toString();
        let dayString = (cellDate.getDate()).toString();

        if(monthString.length == 1) {
            monthString = "0" + monthString;
        }
        
        if(dayString.length == 1) {
            dayString = "0" + dayString;
        }



        const events = this.state.events;

        const cellKey = yearString + "-" + monthString + "-" + dayString;
        
        
        // console.log(events[yearString + "-" + monthString + "-" + dayString]);
        // let test = yearString + "-" + monthString;
        const eventsInDate = events[cellKey];

        // return eventsInDate;

        
        // Create a list of EventModals
        // then return them

        let listOfEventModals = [];

        if(typeof(eventsInDate) !== "undefined") {
            for(let i = 0; i < eventsInDate.length; i++) {                
                listOfEventModals.push(
                    <EventModal event={eventsInDate[i]}/>
                );
            }
        }

        return listOfEventModals;
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

                if(i == 0 && firstDayDate.getDay() <= j) {
                    // Going to add conditional styling. If the cell
                    // is the current date, we will light it up
                    rowCells.push(
                        <div className={"cell" + (this.isCurrentDate(dayCount) ? ' today' : '')}>
                            <div className="day-number">{dayCount}</div>
                            {this.getEvents(dayCount)}
                            {/* <EventModal className="event-modal" events={this.getEvents(dayCount)}/> */}
                        </div>);

                    dayCount++;
                } else if(i == (weekCount - 1) && lastDayDate.getDay() < j) {
                    // This block takes care of the empty cells after last day of month
                    // DO NOT increment dayCount
                    rowCells.push(<div className="cell"></div>);
                } else if (i > 0) {
                    // Going to add conditional styling
                    // is the current date, we will light it up
                    rowCells.push(
                        <div className={"cell" + (this.isCurrentDate(dayCount) ? ' today' : '')}>
                            <div className="day-number">{dayCount}</div>
                            {this.getEvents(dayCount)}
                            {/* <EventModal className="event-modal" events={this.getEvents(dayCount)}/> */}
                        </div>);

                    dayCount++;
                } else {
                    // This block takes care of the empty cells before the 1st of month
                    // DO NOT increment dayCount
                    rowCells.push(<div className="cell"></div>);
                }
                
            }
            // The children will be added from inner for-loop
            calendar.push(<div className={"row-" + i}>{rowCells}</div>);
        }   

        return(
            <div className="calendar-container">

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