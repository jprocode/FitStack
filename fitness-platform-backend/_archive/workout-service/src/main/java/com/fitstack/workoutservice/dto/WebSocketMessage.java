package com.fitstack.workoutservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WebSocketMessage<T> {
    private MessageType type;
    private T payload;
    private Long sessionId;
    private Long timestamp;

    public enum MessageType {
        SET_COMPLETE,
        REST_TIMER_START,
        REST_TIMER_TICK,
        REST_TIMER_END,
        SESSION_UPDATE
    }

    public static <T> WebSocketMessage<T> of(MessageType type, T payload, Long sessionId) {
        return WebSocketMessage.<T>builder()
                .type(type)
                .payload(payload)
                .sessionId(sessionId)
                .timestamp(System.currentTimeMillis())
                .build();
    }
}

