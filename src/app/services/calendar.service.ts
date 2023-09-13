import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Reminder } from '../interfaces/reminder';


@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  reminders: Reminder[] = [];

  constructor() { }

  create(data: Reminder): Reminder {
    return data;
  }

  edit(data: Reminder): Reminder {
    return data;
  }

  list(date: Date): Observable<Reminder[]> {
    console.log(date);

    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();

    const remindersForMonth = this.reminders.filter((reminder: Reminder) => {
      const reminderDate = new Date(reminder.dateTime);
      return (
        reminderDate.getMonth() === currentMonth &&
        reminderDate.getFullYear() === currentYear
      );
    });

    return of(remindersForMonth);
  }

  delete(reminderId: string): boolean {
    console.log(reminderId);
    return true;
  }
}
