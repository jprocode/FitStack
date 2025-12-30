package com.fitstack.userservice.service;

import com.fitstack.userservice.dto.BodyMetricDto;
import com.fitstack.userservice.dto.CreateMetricRequest;
import com.fitstack.userservice.entity.BodyMetric;
import com.fitstack.userservice.entity.User;
import com.fitstack.userservice.exception.NotFoundException;
import com.fitstack.userservice.repository.BodyMetricRepository;
import com.fitstack.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BodyMetricService {

    private final BodyMetricRepository bodyMetricRepository;
    private final UserRepository userRepository;

    @Transactional
    public BodyMetricDto createMetric(Long userId, CreateMetricRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        BodyMetric metric = BodyMetric.builder()
                .user(user)
                .weightKg(request.getWeightKg())
                .bodyFatPct(request.getBodyFatPct())
                .measurementDate(request.getMeasurementDate())
                .notes(request.getNotes())
                .build();

        metric = bodyMetricRepository.save(metric);

        return toDto(metric);
    }

    public List<BodyMetricDto> getMetrics(Long userId) {
        return bodyMetricRepository.findByUserIdOrderByMeasurementDateDesc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Page<BodyMetricDto> getMetrics(Long userId, Pageable pageable) {
        return bodyMetricRepository.findByUserIdOrderByMeasurementDateDesc(userId, pageable)
                .map(this::toDto);
    }

    public List<BodyMetricDto> getMetricsByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return bodyMetricRepository.findByUserIdAndDateRange(userId, startDate, endDate)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public BodyMetricDto getLatestMetric(Long userId) {
        return bodyMetricRepository.findTopByUserIdOrderByMeasurementDateDesc(userId)
                .map(this::toDto)
                .orElse(null);
    }

    @Transactional
    public void deleteMetric(Long userId, Long metricId) {
        BodyMetric metric = bodyMetricRepository.findById(metricId)
                .orElseThrow(() -> new NotFoundException("Metric not found"));

        if (!metric.getUser().getId().equals(userId)) {
            throw new NotFoundException("Metric not found");
        }

        bodyMetricRepository.delete(metric);
    }

    private BodyMetricDto toDto(BodyMetric metric) {
        return BodyMetricDto.builder()
                .id(metric.getId())
                .userId(metric.getUser().getId())
                .weightKg(metric.getWeightKg())
                .bodyFatPct(metric.getBodyFatPct())
                .measurementDate(metric.getMeasurementDate())
                .notes(metric.getNotes())
                .createdAt(metric.getCreatedAt())
                .build();
    }
}

