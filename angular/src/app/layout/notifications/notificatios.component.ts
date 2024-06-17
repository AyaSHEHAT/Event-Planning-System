import { Component, HostListener, OnInit, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationStatus, Notifications, UpdateNotificationStatusDto } from "@shared/Models/Notification";
import { NotificationsService } from "@shared/Services/notificatios.service";
import { Event } from '@shared/Models/Event';
import Swal from 'sweetalert2';
import { combineLatest } from 'rxjs';
import { CurrentUser } from '@shared/Models/current-user';
@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificatios.component.html',
  styleUrl: './notificatios.component.css'
})
export class NotificatiosComponent implements OnInit {
  EventData: Event | any;
  getEventData(arg0: any) {
    return this.Service.GetEventById(arg0).subscribe({
      next: e => {
        if (e) {
          this.EventData = e;
        }
      }
    });
    throw new Error('Method not implemented.');
  }
  oldObj: UpdateNotificationStatusDto = new UpdateNotificationStatusDto(0, NotificationStatus.Pending);
  Reject(item: any) {
    this.getEventData(item.eventId);
    this.getGuestData(item.guestId);
    const emailData = {
      toEmail: this.guestData.result.emailAddress,
      subject: `Invitation Response`,
      body: `Congratulation, Your Request Have Been Submitted For The Event`,
      eventName: this.EventData.result.name,
      date: this.EventData.result.startDate,
      eventAddress: this.EventData.result.location
    };
    this.oldObj.id = item.id;
    this.oldObj.status = NotificationStatus.Rejected;
    Swal.fire({
      title: 'Are you sure You Will Reject This Request?',
      showClass: {
        popup: `
        animate__animated
        animate__fadeInUp
        animate__faster
        `
      },
      hideClass: {
        popup: `
        animate__animated
        animate__fadeOutDown
        animate__faster
        `
      },
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4242c5',
      cancelButtonColor: '#9f9e9e',
      confirmButtonText: 'Reject!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.Service.UpdateNotificationStatus(this.oldObj)
          .subscribe(() => {
            this.Service.sendRejectingEmail(emailData).subscribe(()=>{
            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
              }
            });
            Toast.fire({
              icon: 'success',
              title: 'Invitation Updated Successfully'

            }).then(n => {
              location.reload();

            });
          });
      
    });
  }
  });
  }
  Accept(item: any) {
    this.getEventData(item.eventId);
    this.getGuestData(item.guestId);
    const emailData = {
      toEmail: this.guestData.result.emailAddress,
      subject: `Invitation Response`,
      body: `Congratulation, Your Request Have Been Submitted For The Event`,
      eventName: this.EventData.result.name,
      date: this.EventData.result.startDate,
      eventAddress: this.EventData.result.location
    };
    this.oldObj.id = item.id;
    this.oldObj.status = NotificationStatus.Accepted;
    Swal.fire({
      title: 'Are you sure You Will Accept This Request?',
      showClass: {
        popup: `
          animate__animated
          animate__fadeInUp
          animate__faster
          `
      },
      hideClass: {
        popup: `
          animate__animated
          animate__fadeOutDown
          animate__faster
          `
      },
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4242c5',
      cancelButtonColor: '#9f9e9e',
      confirmButtonText: 'Sure, Accept!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.Service.UpdateNotificationStatus(this.oldObj)
          .subscribe(() => {
            this.Service.sendAcceptanceEmail(emailData).subscribe(()=>{
            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
              }
            });
            Toast.fire({
              icon: 'success',
              title: 'Invitation Updated Successfully'

            }).then(n => {
              location.reload();

            });
          });
        });
      }
    });
  }
  AllNotifications: Notifications[] | any;
  Upcomming: Event[] | any;
  count: number | any = 0;
  count2: number | any = 0;
  AllCount: number | any = 0;
  ngOnInit(): void {

    this.Service.GetUserNotifications().subscribe({
      next: n => {
        if (n && n.result) {
          this.AllNotifications = n.result;
          console.log("AllNotifications.length ", this.AllNotifications.length);
        } else {
          this.AllNotifications = [];
        }

      }
    });
    this.Service.GetUpcommingEventsReminder().subscribe({
      next: U => {
        if (U) {

          this.Upcomming = U;
        }
      }
    });
    combineLatest([
      this.Service.GetNotificationsCount(),
      this.Service.GetReminderCount()
    ]).subscribe({
      next: ([c, r]) => {
        if (c) {
          this.count = c;
        }
        if (r) {
          this.count2 = r;
          this.calculateAllCount();
          this.cdr.markForCheck();
        }
      },
      error: err => {
        console.error('Error fetching counts:', err);
        // Handle error if needed
      }
    });
  }
  calculateAllCount(): void {
    this.AllCount = Number(this.count.result) + Number(this.count2.result);
    console.log("allCount: ", this.AllCount);
  }
  //this.calculateAllCount();
  isChangingFontWeight: boolean = false;
  fontWeight: string = 'bold';
  changeFontWeight(item: any) {
    this.isChangingFontWeight = true;
    this.fontWeight = 'normal';
    this.Service.UpdateReminderStatusFun(item).subscribe({
      next: r => {
        location.reload();
      },
      complete: () => {
        this.isChangingFontWeight = false;
      }
    });
  }
  isCollapsed = false;
  toggleCollapse(event: MouseEvent) {
    this.isCollapsed = !this.isCollapsed;
    event.stopImmediatePropagation();
  }
  guestData: CurrentUser | any;
  getGuestData(id: any) {
    this.Service.GetUserById(id).subscribe({
      next: u => {
        if (u) {
          this.guestData = u;
          console.log("rrrrrr", this.guestData.result);
        }
      }
    })
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isCollapsed = false;
    }
  }

  constructor(public Service: NotificationsService, private elementRef: ElementRef, private cdr: ChangeDetectorRef) {
  }
}
