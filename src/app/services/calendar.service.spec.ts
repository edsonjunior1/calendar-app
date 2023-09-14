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
    return of(/* mock weather data here */);
  }
}

describe('CalendarService', () => {
  let calendarService: CalendarService;
  let calendarDays: any[];

  // Set up before each test
  beforeEach(() => {
    calendarService = new CalendarService();
  });

  it('should add a reminder to the service', () => {
    // Mock the necessary dependencies like WeatherService and EventService
    const mockWeatherService = { getWeatherInformation: jest.fn() };
    const mockEventService = { emitReminderUpdated: jest.fn() };

    // Create a test data object
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

    // Call the addReminder method
    calendarService.addReminder(reminderData, calendarDays);

    // Perform assertions
    expect(mockWeatherService.getWeatherInformation).toHaveBeenCalled();
    // Add more assertions as needed
  });

  it('should edit a reminder in the service', () => {
    // Create a test reminder and reminder ID
    const reminderId = 'e77f9be7-b4ad-4020-8656-c914de40fa34';
    const updatedReminder = {
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

    // Call the editReminder method
    calendarService.editReminder(reminderId, updatedReminder);

    // Perform assertions
    // Check if the reminder is updated correctly in the service
  });

  it('should list reminders for a specific month', () => {
    // Create a test date object for the desired month
    const testDate = new Date(/* Provide a date for the desired month */);

    // Call the list method with the test date
    const reminders$ = calendarService.list(testDate);

    // Subscribe to the observable and perform assertions
    reminders$.subscribe((reminders) => {
      // Check if the returned reminders match the expected ones for the month
    });
  });

  it('should delete a reminder from the service', () => {
    const reminderId = 'e77f9be7-b4ad-4020-8656-c914de40fa34';

    calendarService.delete(reminderId);

    // Perform assertions
    // Check if the reminder is removed correctly from the service
  });
});
