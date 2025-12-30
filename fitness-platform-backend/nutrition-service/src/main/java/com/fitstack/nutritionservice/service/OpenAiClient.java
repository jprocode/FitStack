package com.fitstack.nutritionservice.service;

import com.fitstack.nutritionservice.dto.OpenAiRequest;
import com.fitstack.nutritionservice.dto.OpenAiResponse;
import com.fitstack.nutritionservice.exception.ExternalApiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.List;

@Service
@Slf4j
public class OpenAiClient {

    private final WebClient webClient;

    @Value("${openai.api.url}")
    private String apiUrl;

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.model}")
    private String model;

    public OpenAiClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String generateCompletion(String systemPrompt, String userPrompt) {
        try {
            log.info("Generating completion with OpenAI model: {}", model);

            OpenAiRequest request = OpenAiRequest.builder()
                    .model(model)
                    .messages(List.of(
                            OpenAiRequest.Message.builder()
                                    .role("system")
                                    .content(systemPrompt)
                                    .build(),
                            OpenAiRequest.Message.builder()
                                    .role("user")
                                    .content(userPrompt)
                                    .build()
                    ))
                    .temperature(0.7)
                    .maxTokens(2000)
                    .build();

            OpenAiResponse response = webClient.post()
                    .uri(apiUrl + "/chat/completions")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(OpenAiResponse.class)
                    .retryWhen(Retry.fixedDelay(2, Duration.ofSeconds(2)))
                    .block(Duration.ofMinutes(2));

            if (response == null || response.getChoices() == null || response.getChoices().isEmpty()) {
                throw new ExternalApiException("Empty response from OpenAI API");
            }

            String content = response.getChoices().get(0).getMessage().getContent();
            log.info("Successfully generated completion. Tokens used: {}", 
                    response.getUsage() != null ? response.getUsage().getTotalTokens() : "unknown");

            return content;

        } catch (WebClientResponseException e) {
            log.error("OpenAI API error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new ExternalApiException("Failed to generate meal plan: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error calling OpenAI API: {}", e.getMessage(), e);
            throw new ExternalApiException("Failed to generate meal plan", e);
        }
    }
}

