import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Subject, Observable, forkJoin } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { Reminder } from 'src/app/interfaces/reminder';
import { CalendarService } from 'src/app/services/calendar.service';
import { WeatherService } from 'src/app/services/weather.service';
import { MatDialog } from '@angular/material/dialog';
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
  public daysOfWeek: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednsday', 'Thursday', 'Friday', 'Saturday'];

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
          remindersWithWeather.forEach((reminder: Reminder) => {
            const dayOfMonth = new Date(reminder.dateTime).getDate();
            const calendarCell = this.calendarDays.find(cell => cell.day === dayOfMonth);

            if (calendarCell) {
              if (!calendarCell.reminders) {
                calendarCell.reminders = [];
              }

              calendarCell.reminders.push(reminder);
            }
          });

          this.cd.detectChanges(); // Atualizar a visualização após o carregamento
        });
      });
  }

  private generateCalendar(): void {
    this.calendarDays = this.generateCalendarDays(this.currentMonth);

    // Determinando o dia da semana para o primeiro dia do mês (0 = Domingo, 1 = Segunda, ...)
    const firstDayOfWeek = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1).getDay();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Preenchendo os dias anteriores com espaços em branco
    for (let i = 0; i < firstDayOfWeek; i++) {
      this.calendarDays.unshift({ day: '', isOtherMonth: true, isToday: false, reminders: [] });
    }

    // Verifique se cada dia é igual à data atual no mês atual
    this.calendarDays.forEach(day => {
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

  private generateCalendarDays(month: Date): any[] {
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const days = [];

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isOtherMonth: false,
        isToday: false,
        reminders: [],
      });
    }

    this.actualCurrentMonth = month.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    return days;
  }
}
