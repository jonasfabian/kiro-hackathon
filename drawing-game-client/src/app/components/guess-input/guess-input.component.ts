import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-guess-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guess-input.component.html',
  styleUrl: './guess-input.component.scss'
})
export class GuessInputComponent {
  @Input() isDrawer: boolean = false;
  @Output() guessSubmitted = new EventEmitter<string>();
  
  guessText = '';

  onSubmit(): void {
    if (this.guessText.trim() && !this.isDrawer) {
      this.guessSubmitted.emit(this.guessText.trim());
      this.guessText = '';
    }
  }
}
