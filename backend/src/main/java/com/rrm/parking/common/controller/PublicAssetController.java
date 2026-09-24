package com.rrm.parking.common.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/api/public/assets")
public class PublicAssetController {

    @GetMapping(value = "/mountain", produces = MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<Resource> mountainBackground() {
        Resource resource = new ClassPathResource("mountain.jpeg");

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofHours(12)).cachePublic())
                .contentType(MediaType.IMAGE_JPEG)
                .body(resource);
    }
}
