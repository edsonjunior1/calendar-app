import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Reminder } from 'src/app/interfaces/reminder';
import { CalendarService } from 'src/app/services/calendar.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-reminder-form',
  templateUrl: './reminder-form.component.html',
  styleUrls: ['./reminder-form.component.scss']
})
export class ReminderFormComponent implements OnInit {
  form: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ReminderFormComponent>,
    private formBuilder: FormBuilder,
    private calendarService: CalendarService
  ) { }

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      id: [this.data.reminder?.id || uuidv4()],
      text: [this.data.reminder?.text || '', [Validators.required, Validators.maxLength(30)]],
      dateDay: [this.data.reminder?.dateDay || '', [Validators.required]],
      dateTime: [this.data.reminder?.dateTime || '', [Validators.required]],
      city: [this.data.reminder?.city || '']
    });
  }

  saveReminder() {
    if (this.form.valid) {
      const updatedReminder: Reminder = {
        ...this.data,
        ...this.form.value
      };

      // checking if already exists
      if (this.data?.reminder?.id) {
        this.calendarService.editReminder(this.data.id,updatedReminder);
      } else {
        this.calendarService.addReminder(updatedReminder, this.data.calendarDays);
      }

      this.onClose();
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

}
