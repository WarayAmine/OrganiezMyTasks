import {Component, ChangeDetectionStrategy, ViewChild, TemplateRef, ChangeDetectorRef} from '@angular/core';
import {  startOfDay,  endOfDay,  subDays,  addDays,  endOfMonth,  isSameDay,  isSameMonth,  addHours} from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CalendarDayViewBeforeRenderEvent,
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarMonthViewBeforeRenderEvent, CalendarMonthViewDay,
  CalendarView, CalendarWeekViewBeforeRenderEvent,
  DAYS_OF_WEEK
} from 'angular-calendar';
import { ViewPeriod } from 'calendar-utils';
import { RRule} from 'rrule';
import {el} from '@angular/platform-browser/testing/src/browser_util';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  green: {
    primary: '#1a9f56',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};

interface RecurringEvent {
  title: string;
  color?: any;
  start?: Date;
  end?: Date;
  allday?: boolean;
  rrule?: RRule;
  meta?: {
    description?: string,
    result?: any,
    comments?: string,
    type?: any
  };
}

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('modalContent')
  modalContent: TemplateRef<any>;

  view: CalendarView = CalendarView.Month;

  today = new Date();

  CalendarView = CalendarView;

  viewDate: Date = new Date();
  viewPeriod: ViewPeriod;

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  // exclude weekends
  // 0 : sunday - 6 : saturday
  excludeDays: number[] = [0, 6];

  weekStartsOn = DAYS_OF_WEEK.MONDAY;

  isCollapsedRecurrent = false;
  isCollapsedUnitary = false;
  isCollapsed = false;
  reccurentEventForm = false;
  unitaryEventForm = false;
  deleteUpdateEventTable = false;
  deleteUpdateRecurringEventTable = false;
  deleteUpdateUnitaryEventTable = false;

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Deleted', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();

  recurringEvents: RecurringEvent[] = [
    {
      title: 'Tache reccurente',
      color: colors.yellow,
      meta: {
        description: 'Une date pour la tache reccurente',
        type : 0
      },
      rrule: new RRule({
        freq: RRule.WEEKLY,
        dtstart: subDays(new Date(), 60),
        until: addDays(new Date(), 200),
        // count: 40,
        interval: 1,
        byweekday: RRule.MO
      }),
    }
  ];

  unitaryEvents: CalendarEvent[] = [
    {
      start: subDays(startOfDay(new Date()), 30),
      end: addDays(new Date(), 1),
      title: 'Connexion financeur et recherche',
      color: colors.red,
      actions: this.actions,
      allDay: true,
      resizable: {
        beforeStart: true,
        afterEnd: true
      },
      draggable: true,
      meta : {
        type : 0
      }
    },
    {
      start: startOfDay(new Date()),
      end: addDays(new Date(), 3),
      title: 'Connexion grid',
      color: colors.red,
      actions: this.actions,
      meta: {
        description: 'Il faut se connecter avec le compte ...',
        result: 'KO',
        comments: 'Un commentaire sur le résultat...',
        type : 0
      }
    },
    {
      start: subDays(endOfMonth(new Date()), 3),
      end: addDays(endOfMonth(new Date()), 3),
      title: 'Rapport 5 rempli',
      color: colors.yellow,
      allDay: true,
      meta : {
        type : 1
      }
    },
    {
      start: addHours(startOfDay(new Date()), 2),
      end: new Date(),
      title: 'Accès au reporting',
      color: colors.green,
      actions: this.actions,
      resizable: {
        beforeStart: true,
        afterEnd: true
      },
      draggable: true,
      meta : {
        type : 2
      }
    }
  ];

  events: CalendarEvent[] = this.unitaryEvents;

  activeDayIsOpen = true;

  constructor(private modal: NgbModal, private cdr: ChangeDetectorRef) {}

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.viewDate = date;
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
    }
  }

  eventTimesChanged({
                      event,
                      newStart,
                      newEnd
                    }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.handleEvent('Dropped or resized', event);
    this.refresh.next();
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this.modal.open(this.modalContent, { size: 'lg' });
  }

  updateCalendarEvents(
    viewRender:
      | CalendarMonthViewBeforeRenderEvent
      | CalendarWeekViewBeforeRenderEvent
      | CalendarDayViewBeforeRenderEvent
  ): void {
    if (
      !this.viewPeriod ||
      !isSameDay(this.viewPeriod.start, viewRender.period.start) ||
      !isSameDay(this.viewPeriod.end, viewRender.period.end)
    ) {
      this.viewPeriod = viewRender.period;
      // this.calendarEvents = [];
      console.log('events : ' + this.events.length);
      console.log('events without others : ' + this.events.filter((element) => !this.recurringEvents.includes(element)).length);
      this.events = [];
      this.unitaryEvents.forEach(event => {
        this.events.push(event);
      });
      this.recurringEvents.forEach(event => {
        // const rule: RRule = new RRule({
        //   ...event.rrule,
        //   dtstart: startOfDay(viewRender.period.start),
        //   until: endOfDay(viewRender.period.end)
        // });
        const { title, color, meta} = event;
        event.rrule.all().forEach(date => {
          this.events.push({
            title,
            color,
            start: date,
            meta
          });
        });
      });
      this.cdr.detectChanges();
    }
  }

  addEvent(): void {
    this.events.push({
      title: 'New event',
      start: startOfDay(new Date()),
      end: endOfDay(new Date()),
      color: colors.red,
      draggable: true,
      resizable: {
        beforeStart: true,
        afterEnd: true
      }
    });
    this.refresh.next();
  }

  countErrors(events): number {
    let count = 0;
    events.filter(event => {
      if (event.meta.hasOwnProperty('type') && event.meta.type === 0) {
        count++;
      }
    });
    return count;
  }

  countWarnings(events): number {
    let count = 0;
    events.filter(event => {
      if (event.meta.hasOwnProperty('type') && event.meta.type === 1) {
        count++;
      }
    });
    return count;
  }

  countSuccesses(events): number {
    let count = 0;
    events.filter(event => {
      if (event.meta.hasOwnProperty('type') && event.meta.type === 2) {
        count++;
      }
    });
    return count;
  }

  toShow(date): boolean {
    if (date.getTime() <= this.today.getTime()) {
      return true;
    }
    return false;
  }

  show(element) {
    console.log(element);
  }

  getRecurringFromEvents(element, index, array) {
    if (element.rrule) {
      return element;
    }
  }

  toggleForms(x: number): void {
    if (x === 0) {
      this.unitaryEventForm = false;
      this.deleteUpdateRecurringEventTable = false;
      this.deleteUpdateUnitaryEventTable = false;
      this.reccurentEventForm = !this.reccurentEventForm;
    } else if ( x === 1) {
      this.reccurentEventForm = false;
      this.deleteUpdateRecurringEventTable = false;
      this.deleteUpdateUnitaryEventTable = false;
      this.unitaryEventForm = !this.unitaryEventForm;
    } else if ( x === 2) {
      this.reccurentEventForm = false;
      this.unitaryEventForm = false;
      this.deleteUpdateUnitaryEventTable = false;
      this.deleteUpdateRecurringEventTable = !this.deleteUpdateRecurringEventTable;
    } else if ( x === 3) {
      this.reccurentEventForm = false;
      this.unitaryEventForm = false;
      this.deleteUpdateRecurringEventTable = false;
      this.deleteUpdateUnitaryEventTable = !this.deleteUpdateUnitaryEventTable;
    }
  }
}
