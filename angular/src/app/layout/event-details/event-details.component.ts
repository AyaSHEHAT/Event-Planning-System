
import { FeedbackService } from '../../../shared/services/feedback.service';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventdetailsService } from '../../../shared/services/eventdetails.service';
import { EventBudgetService } from '../../../shared/services/event-budget.service';
import { Event } from '../../../shared/Models/Event';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from "../../../shared/shared.module";
import { UserService } from '../../../shared/services/user-service.service';
import { CurrentUserDataService } from '@shared/services/current-user-data.service';
import Swal from 'sweetalert2';
import { Feedback } from '@shared/Models/feedback';
import { forkJoin, map } from 'rxjs';
import { SavedEventServiceService } from '../../../shared/services/saved-event-service.service'; 
import { SavedEventData } from '../../../shared/Models/SavedEventData';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SharedModule]
})


export class EventDetailsComponent implements OnInit {
  event: Event | undefined;
  eventId: number | undefined;
  budgetAmount: number | undefined;
  user: any;
  loggedInUserId: number | undefined;
  isEventCreator: boolean = false; // Add this property
  rating: any;
  stars: { type: string, title: string }[] = [];
  numberOfRaters: number | undefined;
  feedbackList: Feedback[] = [];
  isEventSaved: boolean = false; 
  isLogin:boolean = false;
  guestCount: number | undefined;
 

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventDetailsService: EventdetailsService,
    private eventBudgetService: EventBudgetService,
    private userService: UserService,
    private currentUserData: CurrentUserDataService,
    private feedbackServ: FeedbackService,
    private savedEventService: SavedEventServiceService 
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.eventId = Number(params.get('id'));
      this.loadEventDetails();
      this.showFeedbackForEvent();
      this.loadGuestCount();
    });

    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    this.currentUserData.GetCurrentUserData().subscribe(
      response => {
        console.log(response);
        this.loggedInUserId = response.id;
        this.isLogin=true;
        this.checkIfEventCreator(); // Check if the event creator is the logged-in user
      },
      error => {
        console.error('Error fetching user data', error);
      }
    );
  }

  loadEventDetails(): void {
    if (this.eventId) {
      this.eventDetailsService.getEventById(this.eventId).subscribe(
        (data) => {
          this.event = data.result;
          console.log("Event Details:", data.result);

          this.rating = this.feedbackServ.getRating(this.event.id).subscribe(
            (res) => {
              console.log("Rating:", res.result.numberOfRaters);
              this.numberOfRaters = res.result.numberOfRaters;
              console.log(res.result.averageRating);
              this.setStars(res.result.averageRating); // Set stars based on rating
            },
            (error) => {
              console.error('Error fetching user data:', error);
            }
          ); // Set rating from event data


          this.userService.getUserById(this.event.userId).subscribe(
            (userData) => {
              this.user = userData.result;
              console.log("User Data:", userData.result);
              this.checkIfEventCreator(); // Check if the event creator is the logged-in user
            },
            (error) => {
              console.error('Error fetching user data:', error);
            }
          );
        },
        (error) => {
          console.error('Error fetching event details:', error);
        }
      );
    }
  }
  loadGuestCount(): void {
    if (this.eventId) {
      this.eventDetailsService.getGuestCountByEventId(this.eventId).subscribe(
        (data) => {
          this.guestCount = data.result;
          console.log("Guest Count:", this.guestCount);
        },
        (error) => {
          console.error('Error fetching guest count:', error);
        }
      );
    }
  }

  checkIfEventCreator(): void {
    if (this.event && this.loggedInUserId !== undefined) {
      this.isEventCreator = (this.event.userId === this.loggedInUserId);
      if (this.isEventCreator) {
        console.log("The logged-in user is the creator of the event.");
      } else {
        console.log("The logged-in user is not the creator of the event.");
      }
    }
  }

  navigateToSetExpenses(eventId: number): void {
    this.router.navigate(['/app/set-expenses'], { queryParams: { eventId: eventId } });
  }

  getUserImage(): string {
    return this.user?.image
      ? this.user.image
      : "https://static.vecteezy.com/system/resources/thumbnails/005/129/844/small/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg";
  }

  openShareAlert(): void {
    const shareUrl = this.getShareUrl();

    Swal.fire({
      title: 'Share this event',
      html: `
        <button class="btn text-primary" id="share-facebook"><i class="fa-brands fa-facebook-f fa-x"></i></button> | 
        <button class="btn text-primary" id="share-linkedin"><i class="fa-brands fa-linkedin-in fa-x"></i></button> | 
        <button class="btn text-dark" id="share-twitter"><i class="fa-brands fa-x-twitter fa-x"></i></button> | 
        <button class="btn text-success" id="share-whatsapp"><i class="fa-brands fa-whatsapp fa-x"></i></button>
        <div class="mt-3 link-forcopy d-flex align-items-center justify-content-center">
          <span id="share-link" class="pr-1" >${shareUrl}</span>
          <button class="btn text-dark"><i class="far fa-clone" id="copy-link"></i></button>
        </div>
      `,
      showCloseButton: true,
      showCancelButton: false,
      focusConfirm: false,
      confirmButtonText: 'Close',
      customClass: {
        popup: 'swal2-custom-popup'
      },
      didOpen: () => {
        document.getElementById('share-facebook')?.addEventListener('click', () => this.shareOnFacebook());
        document.getElementById('share-linkedin')?.addEventListener('click', () => this.shareOnLinkedIn());
        document.getElementById('share-twitter')?.addEventListener('click', () => this.shareOnTwitter());
        document.getElementById('share-whatsapp')?.addEventListener('click', () => this.shareOnWhatsApp());
        document.getElementById('copy-link')?.addEventListener('click', () => this.copyToClipboard(shareUrl));
      }
    });
  }

  getShareUrl(): string {
    return `${window.location.origin}/event-details/${this.eventId}`;
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      Swal.fire('Copied!', 'The link has been copied to the clipboard.', 'success');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }

  shareOnFacebook(): void {
    const shareUrl = this.getShareUrl();
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookShareUrl, '_blank');
  }

  shareOnTwitter(): void {
    const shareUrl = this.getShareUrl();
    const text = `Check out this event! ${this.event?.name}`;
    const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(twitterShareUrl, '_blank');
  }

  shareOnLinkedIn(): void {
    const shareUrl = this.getShareUrl();
    const title = this.event?.name;
    const summary = this.event?.description;
    const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title!)}&summary=${encodeURIComponent(summary!)}`;
    window.open(linkedInShareUrl, '_blank');
  }

  shareOnWhatsApp(): void {
    const shareUrl = this.getShareUrl();
    const whatsAppShareUrl = `https://wa.me/?text=${encodeURIComponent(shareUrl)}`;
    window.open(whatsAppShareUrl, '_blank');
  }

  sendEmail(email: string): void {
    if (email) {
      console.log(email);
      window.location.href = `mailto:${email}`;
    } else {
      console.error('Email address is not defined');
    }
  }

  setStars(rating: number): void {
    this.stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        this.stars.push({ type: 'full', title: `${i} stars` });
      } else if (rating > i - 1) {
        this.stars.push({ type: 'half', title: `${i - 0.5} stars` });
      } else {
        this.stars.push({ type: 'empty', title: `${i} stars` });
      }
    }
  }

  // this.feedbackServ.getAllFeedback(this.eventId).subscribe(
  //   data => {
  //     const userRequests = data.map(feedback =>
  //       this.userService.getUserById(feedback.userId)
  //         .pipe(
  //           map(user => ({ ...feedback, user: user.result }))
  //         )
  //     );

  showFeedbackForEvent(): void {
    if (this.eventId) {
      console.log('Fetching feedback for event ID:', this.eventId);

      this.feedbackServ.getAllFeedback(this.eventId).subscribe(
        (data) => {
          console.log('Feedback data:', data);
           data.map(feedback =>
            this.userService.getUserById2(feedback.userId)
              .pipe(
                map(user => ({ ...feedback, user: user }))
              ).subscribe(data =>
                this.feedbackList.push(data)
              ))
        },
        (error) => {
          console.error('Error fetching feedback:', error);
        }
      );
    }
  }
  toggleSavedEvent(): void {
    this.isEventSaved = !this.isEventSaved;
    if (this.isEventSaved) {
      this.saveEvent();
    } else {
      this.removeEventFromSaved();
    }
  }

  saveEvent(): void {
    if (this.event && this.loggedInUserId) {
      const savedEventData: SavedEventData = {
        eventId: this.event.id,
        userId: this.loggedInUserId
      };

      this.savedEventService.createSavedEvent(savedEventData).subscribe(
        response => {
          console.log('Event saved successfully:', response);
        },
        error => {
          console.error('Error saving event:', error);
        }
      );
    }
  }
  removeEventFromSaved(): void {
    console.log("Event removed from saved list.");
    // Implement your logic to remove the event from the saved list
  }
}
