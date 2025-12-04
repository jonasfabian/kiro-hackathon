import { Component, Input, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Guess } from '../../models/types';

@Component({
  selector: 'app-guess-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guess-feed.component.html',
  styleUrl: './guess-feed.component.scss'
})
export class GuessFeedComponent implements AfterViewChecked {
  @Input() guesses: Guess[] = [];
  @ViewChild('feedContainer') feedContainer!: ElementRef<HTMLDivElement>;
  
  private shouldScroll = false;

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnChanges(): void {
    this.shouldScroll = true;
  }

  private scrollToBottom(): void {
    if (this.feedContainer) {
      const element = this.feedContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}
