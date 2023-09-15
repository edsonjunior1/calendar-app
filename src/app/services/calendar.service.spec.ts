import { Observable, Subject, of } from 'rxjs';
import { CalendarService } from './calendar.service';

class MockEventService {
  private reminderUpdatedSubject = new Subject<void>();
  emitReminderUpdated() {
    this.reminderUpdatedSubject.next();
  }
  onReminderUpdated(): Observable<void> {
    return this.reminderUpdatedSubject.asObservable();
  }
}

class MockWeatherService {
  getWeatherInformation(city: string): Observable<any> {
    const mockWeatherData = {
      coord: { lon: -0.13, lat: 51.51 },
      weather: [{ id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' }],
      base: 'stations',
      main: { temp: 18.42, feels_like: 19.42, temp_min: 17.13, temp_max: 19.98, pressure: 1016, humidity: 67 },
      visibility: 10000,
      wind: { speed: 3.6, deg: 40 },
      clouds: { all: 20 },
      dt: 1631684417,
      sys: { type: 2, id: 2019646, country: 'GB', sunrise: 1631640622, sunset: 1631685367 },
      timezone: 3600,
      id: 2643743,
      name: 'London',
      cod: 200,
    };
    return of(mockWeatherData);
  }
}


describe('CalendarService', () => {
  let calendarDays: any[] = [];
  const mockEventService = new MockEventService();
  const mockWeatherService = new MockWeatherService();
  let calendarService = new CalendarService(mockWeatherService as any, mockEventService as any);
  const initialReminder =
  {
    "reminder": {
      "day": 1,
      "isOtherMonth": false,
      "isToday": false,
      "reminders": []
    },
    "id": "34c35212-6f26-492e-900f-5bee0474c33e",
    "text": "teste calendar",
    "dateDay": new Date("2023-09-01"),
    "dateTime": "10:46",
    "city": "London"
  };

  beforeEach(() => {
    calendarService = new CalendarService(mockWeatherService as any, mockEventService as any);
  });

  it('should add a reminder to the service', (done) => {
    const reminderData =
    {
      "reminder": {
        "day": 1,
        "isOtherMonth": false,
        "isToday": false,
        "reminders": []
      },
      "id": "34c35212-6f26-492e-900f-5bee0474c33e",
      "text": "teste calendar",
      "dateDay": new Date("2023-09-01"),
      "dateTime": "10:46",
      "city": "London"
    };
    calendarDays.push({
      day: 1,
      isOtherMonth: false,
      isToday: false,
      reminders: [],
    })



    calendarService.addReminder(reminderData, calendarDays);
    calendarService.calendarDays$.subscribe((addedReminder) => {
      expect(mockWeatherService.getWeatherInformation).toHaveBeenCalled();
      expect(addedReminder.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should edit a reminder in the service', (done) => {
    const reminderId = '34c35212-6f26-492e-900f-5bee0474c33e';
    const reminderData =
    {
      "reminder": {
        "day": 1,
        "isOtherMonth": false,
        "isToday": false,
        "reminders": []
      },
      "id": "34c35212-6f26-492e-900f-5bee0474c33e",
      "text": "teste calendar",
      "dateDay": new Date("2023-09-01"),
      "dateTime": "10:46",
      "city": "London"
    };
    const updatedReminder = {
      "reminder": {
        "day": 1,
        "isOtherMonth": false,
        "isToday": false,
        "reminders": []
      },
      "id": reminderId,
      "text": "updated reminder",
      "dateDay": new Date("2023-09-01"),
      "dateTime": "11:46",
      "city": "Chelsea"
    };

    calendarService.addReminder(reminderData, calendarDays);
    calendarService.editReminder(reminderId, updatedReminder);

    calendarService.calendarDays$.subscribe((updatedReminder) => {
      const editedReminder = updatedReminder.find(r => r.id === reminderId);
      expect(editedReminder).toBeDefined();

      done();
    });

  });

  it('should list reminders for a specific month', (done) => {
    const testDate = new Date("2023-09-01");

    calendarService.list(testDate).subscribe(res => {
      expect(res.length).toBeGreaterThan(0);

      done();
    });
  });

  it('should delete a reminder from the service', (done) => {
    const reminderId = '34c35212-6f26-492e-900f-5bee0474c33e';
    calendarService.addReminder(initialReminder, calendarDays);

    calendarService.delete(reminderId);

    calendarService.calendarDays$.subscribe((reminder) => {
      const deletedReminder = reminder.find((r) => r.id === reminderId);
      expect(deletedReminder).toBeUndefined();

      done();
    });
  });
});
