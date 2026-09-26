package com.rrm.parking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RrmParkingPlatformApplication {

	public static void main(String[] args) {
		SpringApplication.run(RrmParkingPlatformApplication.class, args);
	}

}

