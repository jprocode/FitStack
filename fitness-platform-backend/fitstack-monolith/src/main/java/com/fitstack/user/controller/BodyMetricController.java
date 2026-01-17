package com.fitstack.user.controller;

import com.fitstack.user.dto.BodyMetricDto;
import com.fitstack.user.dto.CreateMetricRequest;
import com.fitstack.user.service.BodyMetricService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/users/metrics")
@RequiredArgsConstructor
public class BodyMetricController {

    private final BodyMetricService bodyMetricService;

    @PostMapping
    public ResponseEntity<BodyMetricDto> createMetric(
            HttpServletRequest request,
            @Valid @RequestBody CreateMetricRequest createRequest) {
        System.out.println("=== CREATE METRIC REQUEST ===");
        System.out.println("Weight: " + createRequest.getWeightKg());
        System.out.println("Date: " + createRequest.getMeasurementDate());
        System.out.println("Body Fat: " + createRequest.getBodyFatPct());
        Long userId = getUserId(request);
        System.out.println("User ID: " + userId);
        BodyMetricDto metric = bodyMetricService.createMetric(userId, createRequest);
        return new ResponseEntity<>(metric, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BodyMetricDto>> getMetrics(HttpServletRequest request) {
        Long userId = getUserId(request);
        List<BodyMetricDto> metrics = bodyMetricService.getMetrics(userId);
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<BodyMetricDto>> getMetricsPaginated(
            HttpServletRequest request,
            Pageable pageable) {
        Long userId = getUserId(request);
        Page<BodyMetricDto> metrics = bodyMetricService.getMetrics(userId, pageable);
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/range")
    public ResponseEntity<List<BodyMetricDto>> getMetricsByDateRange(
            HttpServletRequest request,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long userId = getUserId(request);
        List<BodyMetricDto> metrics = bodyMetricService.getMetricsByDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/latest")
    public ResponseEntity<BodyMetricDto> getLatestMetric(HttpServletRequest request) {
        Long userId = getUserId(request);
        BodyMetricDto metric = bodyMetricService.getLatestMetric(userId);
        return ResponseEntity.ok(metric);
    }

    @DeleteMapping("/{metricId}")
    public ResponseEntity<Void> deleteMetric(
            HttpServletRequest request,
            @PathVariable Long metricId) {
        Long userId = getUserId(request);
        bodyMetricService.deleteMetric(userId, metricId);
        return ResponseEntity.noContent().build();
    }

    private Long getUserId(HttpServletRequest request) {
        return (Long) request.getAttribute("userId");
    }
}
