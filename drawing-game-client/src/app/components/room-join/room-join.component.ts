import { Component, OnInit } from '@angular/core';
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
export class RoomJoinComponent implements OnInit {
  joinForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private wsService: WebSocketService,
    private router: Router
  ) {
    // Try to restore previous session data
    const savedRoomId = localStorage.getItem('roomId') || '';
    const savedPlayerName = localStorage.getItem('playerName') || '';

    this.joinForm = this.fb.group({
      roomId: [savedRoomId, [Validators.required, Validators.minLength(1)]],
      playerName: [savedPlayerName, [Validators.required, Validators.minLength(2), Validators.maxLength(20)]]
    });
  }

  ngOnInit(): void {
    // Auto-reconnect if session exists (e.g., after page refresh)
    const savedRoomId = localStorage.getItem('roomId');
    const savedPlayerName = localStorage.getItem('playerName');

    if (savedRoomId && savedPlayerName) {
      console.log('Session found, auto-reconnecting to room:', savedRoomId);
      this.wsService.connect(savedRoomId, savedPlayerName);
      this.router.navigate(['/game', savedRoomId]);
    }
  }

  onSubmit(): void {
    if (this.joinForm.valid) {
      const { roomId, playerName } = this.joinForm.value;
      
      // Save to localStorage for persistence
      localStorage.setItem('roomId', roomId);
      localStorage.setItem('playerName', playerName);
      
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
