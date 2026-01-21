package com.fitstack.workoutservice.service;

import com.fitstack.workoutservice.dto.RestTimerMessage;
import com.fitstack.workoutservice.dto.WebSocketMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
@RequiredArgsConstructor
@Slf4j
public class RestTimerService {

    private final SimpMessagingTemplate messagingTemplate;
    
    // Track active timers by session ID
    private final Map<Long, AtomicBoolean> activeTimers = new ConcurrentHashMap<>();

    @Async
    public void startRestTimer(Long sessionId, Long exerciseId, Integer setNumber, Integer totalSeconds) {
        // Cancel any existing timer for this session
        stopRestTimer(sessionId);
        
        AtomicBoolean isActive = new AtomicBoolean(true);
        activeTimers.put(sessionId, isActive);
        
        log.info("Starting rest timer for session {} - {} seconds", sessionId, totalSeconds);
        
        // Send start message
        RestTimerMessage startMessage = RestTimerMessage.builder()
                .sessionId(sessionId)
                .remainingSeconds(totalSeconds)
                .totalSeconds(totalSeconds)
                .active(true)
                .exerciseId(exerciseId)
                .setNumber(setNumber)
                .build();
        
        broadcastTimerMessage(sessionId, WebSocketMessage.MessageType.REST_TIMER_START, startMessage);
        
        // Countdown loop
        for (int remaining = totalSeconds; remaining >= 0 && isActive.get(); remaining--) {
            try {
                RestTimerMessage tickMessage = RestTimerMessage.builder()
                        .sessionId(sessionId)
                        .remainingSeconds(remaining)
                        .totalSeconds(totalSeconds)
                        .active(true)
                        .exerciseId(exerciseId)
                        .setNumber(setNumber)
                        .build();
                
                broadcastTimerMessage(sessionId, WebSocketMessage.MessageType.REST_TIMER_TICK, tickMessage);
                
                if (remaining > 0) {
                    Thread.sleep(1000);
                }
            } catch (InterruptedException e) {
                log.debug("Rest timer interrupted for session {}", sessionId);
                Thread.currentThread().interrupt();
                break;
            }
        }
        
        // Send end message if timer completed naturally
        if (isActive.get()) {
            RestTimerMessage endMessage = RestTimerMessage.builder()
                    .sessionId(sessionId)
                    .remainingSeconds(0)
                    .totalSeconds(totalSeconds)
                    .active(false)
                    .exerciseId(exerciseId)
                    .setNumber(setNumber)
                    .build();
            
            broadcastTimerMessage(sessionId, WebSocketMessage.MessageType.REST_TIMER_END, endMessage);
            log.info("Rest timer completed for session {}", sessionId);
        }
        
        activeTimers.remove(sessionId);
    }

    public void stopRestTimer(Long sessionId) {
        AtomicBoolean isActive = activeTimers.get(sessionId);
        if (isActive != null) {
            isActive.set(false);
            activeTimers.remove(sessionId);
            log.info("Stopped rest timer for session {}", sessionId);
        }
    }

    public boolean isTimerActive(Long sessionId) {
        AtomicBoolean isActive = activeTimers.get(sessionId);
        return isActive != null && isActive.get();
    }

    private void broadcastTimerMessage(Long sessionId, WebSocketMessage.MessageType type, RestTimerMessage message) {
        WebSocketMessage<RestTimerMessage> wsMessage = WebSocketMessage.of(type, message, sessionId);
        messagingTemplate.convertAndSend("/topic/workout/" + sessionId, wsMessage);
    }
}

