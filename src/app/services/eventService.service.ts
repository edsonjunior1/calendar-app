import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private reminderUpdatedSubject = new Subject<void>();

  emitReminderUpdated() {
    this.reminderUpdatedSubject.next();
  }

  onReminderUpdated(): Observable<void> {
    return this.reminderUpdatedSubject.asObservable();
  }
}
