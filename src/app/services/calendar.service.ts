import { EventService } from './eventService.service';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Reminder } from '../interfaces/reminder';
import { WeatherService } from './weather.service';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  reminders: Reminder[] = [];

  constructor(
    private weatherService: WeatherService,
    private eventService: EventService
  ) { }

  addReminder(data: Reminder): Observable<Reminder[]> {
    this.weatherService.getWeatherInformation(data.data[0].city).subscribe((weatherInfo) => {
      const reminderWithWeather = { ...data, weather: weatherInfo };

      this.reminders.push(reminderWithWeather);
      console.log(this.reminders);

      // Emite um evento para notificar que os lembretes foram atualizados
      this.eventService.emitReminderUpdated();
    });

    return of(this.reminders);
  }

  editReminder(reminderId: string, updatedReminder: Reminder): Observable<Reminder[]> {
    const index = this.reminders.findIndex((r,index) => r[index].id === reminderId);
    if (index !== -1) {
      this.reminders[index] = updatedReminder;

      // Emite um evento para notificar que os lembretes foram atualizados
      this.eventService.emitReminderUpdated();
    }
    return of(this.reminders);
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

    return of(remindersForMonth);
  }

  delete(reminderId: string): Observable<Reminder[]> {
    const index = this.reminders.findIndex((r) => r.id === reminderId);
    if (index !== -1) {
      this.reminders.splice(index, 1);
    }

    return of(this.reminders);
  }
}
