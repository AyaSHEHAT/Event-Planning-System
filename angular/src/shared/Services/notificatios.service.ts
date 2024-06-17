import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notifications, UpdateNotificationStatusDto, UpdateReminderStatusDto } from '../Models/Notification';

interface ApiResponse<T> {
  result: T;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private URL = "https://localhost:44311/api/services/app/Notification/GetAllUserNotifications";
  private UpcommingURL = "https://localhost:44311/api/services/app/Event/GetReminderOfUpcomming";
  private UnreadCountURL = "https://localhost:44311/api/services/app/Notification/GetNotificationCount";
  private UpdateUrl = 'https://localhost:44311/api/services/app/Notification/UpdateNotificationStatus';
  private ReminderUnreadCount = "https://localhost:44311/api/services/app/Event/GetReminderCount";
  private UpdateReminderStatusUrl = "https://localhost:44311/api/services/app/Event/UpdateReminderStatus";
  private GetUserURL = "https://localhost:44311/api/services/app/User/Get?Id=";
  private EventUrl = "https://localhost:44311/api/services/app/Event/Get?Id=";
  private AcceptanceEmail = "https://localhost:44311/api/Invitation/SendAcceptanceEmail";
  private RejectingEmail = "https://localhost:44311/api/Invitation/SendRejectionEmail";
  constructor(private http: HttpClient) { }

  GetUserNotifications(): Observable<ApiResponse<Notifications[]>> {
    return this.http.get<ApiResponse<Notifications[]>>(this.URL);
  }

  GetUpcommingEventsReminder(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(this.UpcommingURL);
  }

  GetNotificationsCount(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(this.UnreadCountURL);
  }

  UpdateNotificationStatus(updatedNotification: UpdateNotificationStatusDto): Observable<any> {
    return this.http.put<any>(this.UpdateUrl, updatedNotification);
  }

  UpdateReminderStatusFun(updatedNotification: UpdateReminderStatusDto): Observable<any> {
    return this.http.put<any>(this.UpdateReminderStatusUrl, updatedNotification);
  }

  GetReminderCount(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(this.ReminderUnreadCount);
  }
  GetUserById(id: any) {
    return this.http.get(this.GetUserURL + id);
  }
  GetEventById(id: any) {
    return this.http.get(this.EventUrl + id);
  }
  sendAcceptanceEmail(data: any) {
    return this.http.post(this.AcceptanceEmail, data);
  }
  sendRejectingEmail(data: any) {
    return this.http.post(this.RejectingEmail, data);

  }
}
