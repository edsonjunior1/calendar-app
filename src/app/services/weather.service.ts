import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = 'SHOULD_CREATE_YOUR_OWN_KEY';

  constructor(private http: HttpClient) { }

  getWeatherInformation(city: string): Observable<any> {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${this.apiKey}`;
    return this.http.get(apiUrl);
  }
}
