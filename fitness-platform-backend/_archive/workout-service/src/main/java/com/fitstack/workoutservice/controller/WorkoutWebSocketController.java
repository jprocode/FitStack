package com.fitstack.workoutservice.controller;

import com.fitstack.workoutservice.dto.RestTimerMessage;
import com.fitstack.workoutservice.dto.SetCompleteMessage;
import com.fitstack.workoutservice.dto.WebSocketMessage;
import com.fitstack.workoutservice.dto.WorkoutSetDto;
import com.fitstack.workoutservice.service.RestTimerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WorkoutWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final RestTimerService restTimerService;

    @MessageMapping("/workout/{sessionId}/set-complete")
    public void handleSetComplete(
            @DestinationVariable Long sessionId,
            SetCompleteMessage setMessage
    ) {
        log.info("Set complete received for session {}: exercise {} set {}", 
                sessionId, setMessage.getExerciseId(), setMessage.getSetNumber());
        
        // Broadcast set completion to all subscribers
        WebSocketMessage<SetCompleteMessage> wsMessage = WebSocketMessage.of(
                WebSocketMessage.MessageType.SET_COMPLETE, 
                setMessage, 
                sessionId
        );
        messagingTemplate.convertAndSend("/topic/workout/" + sessionId, wsMessage);
        
        // Start rest timer if rest time is specified
        if (setMessage.getRestTimeSeconds() != null && setMessage.getRestTimeSeconds() > 0) {
            restTimerService.startRestTimer(
                    sessionId, 
                    setMessage.getExerciseId(), 
                    setMessage.getSetNumber(), 
                    setMessage.getRestTimeSeconds()
            );
        }
    }

    @MessageMapping("/workout/{sessionId}/start-timer")
    public void handleStartTimer(
            @DestinationVariable Long sessionId,
            RestTimerMessage timerMessage
    ) {
        log.info("Starting rest timer for session {}: {} seconds", sessionId, timerMessage.getTotalSeconds());
        restTimerService.startRestTimer(
                sessionId,
                timerMessage.getExerciseId(),
                timerMessage.getSetNumber(),
                timerMessage.getTotalSeconds()
        );
    }

    @MessageMapping("/workout/{sessionId}/stop-timer")
    public void handleStopTimer(@DestinationVariable Long sessionId) {
        log.info("Stopping rest timer for session {}", sessionId);
        restTimerService.stopRestTimer(sessionId);
        
        // Broadcast timer end
        RestTimerMessage endMessage = RestTimerMessage.builder()
                .sessionId(sessionId)
                .active(false)
                .remainingSeconds(0)
                .build();
        WebSocketMessage<RestTimerMessage> wsMessage = WebSocketMessage.of(
                WebSocketMessage.MessageType.REST_TIMER_END,
                endMessage,
                sessionId
        );
        messagingTemplate.convertAndSend("/topic/workout/" + sessionId, wsMessage);
    }

    public void broadcastSetComplete(Long sessionId, WorkoutSetDto setDto) {
        WebSocketMessage<WorkoutSetDto> wsMessage = WebSocketMessage.of(
                WebSocketMessage.MessageType.SET_COMPLETE,
                setDto,
                sessionId
        );
        messagingTemplate.convertAndSend("/topic/workout/" + sessionId, wsMessage);
    }
}

