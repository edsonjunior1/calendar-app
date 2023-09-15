import { Injectable, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Reminder } from '../interfaces/reminder';
import { WeatherService } from './weather.service';
import { EventService } from './eventService.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private reminders: Reminder[] = [];
  private calendarDaysSubject = new BehaviorSubject<Reminder[]>([]);
  calendarDays$ = this.calendarDaysSubject.asObservable();

  constructor(
    private weatherService: WeatherService,
    private eventService: EventService,
  ) { }

  addReminder(data: Reminder, calendarDays: any[]): void {
    this.weatherService.getWeatherInformation(data.city).subscribe((weatherInfo) => {
      const reminderWithWeather = { ...data, weather: weatherInfo };

      this.reminders.push(reminderWithWeather);

      const dataDay = new Date(data.dateDay + `T${data.dateTime}:00`);
      const dayOfMonth = dataDay.getDate();
      const calendarCell = calendarDays.find((cell) => cell.day === dayOfMonth);

      if (calendarCell) {
        if (!calendarCell.reminders) {
          calendarCell.reminders = [];
        }

        calendarCell.reminders.push(reminderWithWeather);
      }

      // Notification when the reminder is updated
      this.eventService.emitReminderUpdated();

      // Updating the calendarDaysSubject with new reminders list
      this.calendarDaysSubject.next(this.reminders);
    });
  }

  editReminder(reminderId: string, updatedReminder: Reminder | any, calendarD: any[]): void {
    this.weatherService.getWeatherInformation(updatedReminder.city).subscribe((newWeatherInfo) => {
      const index = this.reminders.findIndex((r) => r.id === reminderId);
      if (index !== -1) {
        const originalReminder = { ...this.reminders[index] };

        const dayOfMonth = new Date(updatedReminder.dateDay + `T${updatedReminder.dateTime}:00`).getDate();
        const calendarCell = calendarD.find((cell) => cell.day === dayOfMonth);

        if (calendarCell) {
          if (originalReminder.dateDay !== updatedReminder.dateDay) {
            const oldReminderIndex = calendarCell.reminders.findIndex((r) => r.id === reminderId);
            this.delete(reminderId);
            if (oldReminderIndex !== -1) {
              calendarCell.reminders.splice(oldReminderIndex, 1);
            }

            const updatedReminderObj = {
              text: updatedReminder.text,
              id: uuidv4(),
              dateDay: updatedReminder.dateDay,
              dateTime: updatedReminder.dateTime,
              city: updatedReminder.city,
              weather: newWeatherInfo,
            };
            calendarCell.reminders[index] = updatedReminderObj;
          } else {
            const updatedReminderObj = {
              ...calendarCell.reminders[index],
              text: updatedReminder.text,
              dateTime: updatedReminder.dateTime,
              city: updatedReminder.city,
              weather: newWeatherInfo,
            };
            calendarCell.reminders[index] = updatedReminderObj;
          }
        }

        this.eventService.emitReminderUpdated();
        this.calendarDaysSubject.next(calendarCell);
      }
    });
  }


  list(date: Date): Observable<Reminder[]> {
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();

    const remindersForMonth = this.reminders.filter((reminder: Reminder) => {
      const reminderDate = new Date(reminder.dateTime);
      return (
        reminderDate.getMonth() === currentMonth &&
        reminderDate.getFullYear() === currentYear
      );
    });

    return new Observable<Reminder[]>(observer => {
      observer.next(remindersForMonth);
      observer.complete();
    });
  }

  delete(reminderId: string): void {
    const index = this.reminders.findIndex((r) => r.id === reminderId);
    if (index !== -1) {
      this.reminders.splice(index, 1);
      this.eventService.emitReminderUpdated();
    }
  }
}
