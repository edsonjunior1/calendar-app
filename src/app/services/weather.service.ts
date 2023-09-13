import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = '508bfa7ee4772cf085a55834b1bd34fe';

  constructor(private http: HttpClient) { }

  getWeatherInformation(city: string): Observable<any> {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${this.apiKey}`;
    return this.http.get(apiUrl);
  }
}
