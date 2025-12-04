import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WebSocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-room-join',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './room-join.component.html',
  styleUrl: './room-join.component.scss'
})
export class RoomJoinComponent {
  joinForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private wsService: WebSocketService,
    private router: Router
  ) {
    this.joinForm = this.fb.group({
      roomId: ['', [Validators.required, Validators.minLength(1)]],
      playerName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]]
    });
  }

  onSubmit(): void {
    if (this.joinForm.valid) {
      const { roomId, playerName } = this.joinForm.value;
      this.wsService.connect(roomId, playerName);
      this.router.navigate(['/game', roomId]);
    }
  }

  get roomId() {
    return this.joinForm.get('roomId');
  }

  get playerName() {
    return this.joinForm.get('playerName');
  }
}
