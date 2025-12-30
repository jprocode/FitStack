package com.fitstack.workoutservice.controller;

import com.fitstack.workoutservice.dto.WorkoutSetDto;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WorkoutWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/workout/{sessionId}/set-complete")
    @SendTo("/topic/workout/{sessionId}")
    public WorkoutSetDto handleSetComplete(
            @DestinationVariable Long sessionId,
            WorkoutSetDto setDto
    ) {
        return setDto;
    }

    public void broadcastSetComplete(Long sessionId, WorkoutSetDto setDto) {
        messagingTemplate.convertAndSend("/topic/workout/" + sessionId, setDto);
    }
}

