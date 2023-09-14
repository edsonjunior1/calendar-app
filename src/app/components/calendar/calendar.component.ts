import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject, forkJoin } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { Reminder } from 'src/app/interfaces/reminder';
import { CalendarService } from 'src/app/services/calendar.service';
import { WeatherService } from 'src/app/services/weather.service';
import { ReminderFormComponent } from '../reminder-form/reminder-form.component';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<boolean>();
  public currentMonth: Date;
  public calendarDays: any[];
  public actualCurrentMonth: string;
  public daysOfWeek: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  public dateViewFmt = 'dd/MM/yyyy HH:mm';

  constructor(
    private calendarService: CalendarService,
    private weatherService: WeatherService,
    private matDialog: MatDialog,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initializeCalendar();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  previousMonth(): void {
    this.updateMonth(-1);
  }

  nextMonth(): void {
    this.updateMonth(1);
  }

  openReminderForm(reminder?: Reminder): void {
    this.matDialog.open(ReminderFormComponent, {
      data: {
        reminder,
        calendarDays: this.calendarDays
      },
    });
  }

  private initializeCalendar(): void {
    this.currentMonth = new Date();
    this.generateCalendar();
    this.fetchAndDisplayReminders();
  }

  private updateMonth(monthOffset: number): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + monthOffset);
    this.generateCalendar();
    this.fetchAndDisplayReminders();
  }

  private updateCalendarWithReminders(reminders: Reminder[]): void {
    reminders.forEach((reminder: Reminder) => {
      const dayOfMonth = new Date(reminder.dateTime).getDate();
      const calendarCell = this.calendarDays.find((cell) => cell.day === dayOfMonth);

      if (calendarCell) {
        if (!calendarCell.reminders) {
          calendarCell.reminders = [];
        }

        calendarCell.reminders.push(reminder);
      }
    });
  }

  private fetchAndDisplayReminders(): void {
    this.calendarService.list(this.currentMonth)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((reminders: Reminder[]) => {
        const requests = reminders.map((reminder: Reminder) => {
          return this.getWeather(reminder.city)
            .pipe(
              takeUntil(this.onDestroy$),
              map((weatherData: any) => {
                return {
                  ...reminder,
                  weather: weatherData.weatherInfo,
                };
              })
            );
        });

        forkJoin(requests).subscribe((remindersWithWeather: Reminder[]) => {
          this.updateCalendarWithReminders(remindersWithWeather);
          this.cd.detectChanges();
        });


      });
  }

  private generateCalendar(): void {
    const firstDayOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0).getDate();

    this.calendarDays = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      this.calendarDays.push({ day: '', isOtherMonth: true, isToday: false, reminders: [] });
    }

    // Adding the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      this.calendarDays.push({
        day: i,
        isOtherMonth: false,
        isToday: false,
        reminders: [],
      });
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    this.actualCurrentMonth = this.currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    // Verify if each day is equal to the current day in the month
    this.calendarDays.forEach((day) => {
      const dayDate = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), day.day);

      if (
        dayDate.getMonth() === currentMonth &&
        dayDate.getFullYear() === currentYear &&
        dayDate.getDate() === currentDate.getDate()
      ) {
        day.isToday = true;
      }
    });
  }

  private getWeather(city: string): Observable<any> {
    return this.weatherService.getWeatherInformation(city);
  }
}
