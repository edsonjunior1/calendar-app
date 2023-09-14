import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Reminder } from '../interfaces/reminder';
import { WeatherService } from './weather.service';
import { EventService } from './eventService.service';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private reminders: Reminder[] = [];
  private calendarDaysSubject = new BehaviorSubject<Reminder[]>([]);
  calendarDays$ = this.calendarDaysSubject.asObservable();

  constructor(
    private weatherService: WeatherService,
    private eventService: EventService
  ) { }

  addReminder(data: Reminder, calendarDays: any[], currentMonth: Date): void {
    this.weatherService.getWeatherInformation(data.city).subscribe((weatherInfo) => {
      const reminderWithWeather = { ...data, weather: weatherInfo };

      // Adicione o lembrete à lista de lembretes no serviço
      this.reminders.push(reminderWithWeather);

      // Atualize o this.calendarDays aqui
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

  editReminder(reminderId: string, updatedReminder: Reminder): void {
    const index = this.reminders.findIndex((r) => r.id === reminderId);
    if (index !== -1) {
      this.reminders[index] = updatedReminder;

      // Send notification to notify that the reminder has been updated
      this.eventService.emitReminderUpdated();
    }
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
