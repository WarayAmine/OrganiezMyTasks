import {  Component,  ChangeDetectionStrategy,  ViewChild,  TemplateRef } from '@angular/core';
import {  startOfDay,  endOfDay,  subDays,  addDays,  endOfMonth,  isSameDay,  isSameMonth,  addHours} from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {  CalendarEvent,  CalendarEventAction,  CalendarEventTimesChangedEvent,  CalendarView, DAYS_OF_WEEK} from 'angular-calendar';

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

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  // exclude weekends
  // 0 : sunday - 6 : saturday
  excludeDays: number[] = [0, 6];

  weekStartsOn = DAYS_OF_WEEK.SUNDAY;

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

  events: CalendarEvent[] = [
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

  activeDayIsOpen = true;

  constructor(private modal: NgbModal) {}

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    // if (isSameMonth(date, this.viewDate)) {
      this.viewDate = date;
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
    // }
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
        // console.log(event.title + ' warning');
      }
    });
    return count;
  }

  countSuccesses(events): number {
    let count = 0;
    events.filter(event => {
      if (event.meta.hasOwnProperty('type') && event.meta.type === 2) {
        count++;
        // console.log(event.title + ' success');
      }
    });
    return count;
  }

  toShow(date): boolean {
    console.log(date.getTime());
    console.log('TODAY : ' + this.today.getTime());
    if (date.getTime() <= this.today.getTime()) {
      return true;
    }
    return false;
  }

  show(element) {
    console.log(element);
  }
}
