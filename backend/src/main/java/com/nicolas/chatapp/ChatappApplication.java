package com.nicolas.chatapp;

import com.nicolas.chatapp.config.AdminProperties;
import com.nicolas.chatapp.config.EncryptionProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@SpringBootApplication
@EnableConfigurationProperties({AdminProperties.class, EncryptionProperties.class})
public class ChatappApplication {

	public static void main(String[] args) {
		prepareRuntimeDirectories();
		SpringApplication.run(ChatappApplication.class, args);
	}

	private static void prepareRuntimeDirectories() {
		try {
			Files.createDirectories(Path.of(System.getProperty("user.home"), ".yijia", "data"));
			Files.createDirectories(Path.of(System.getProperty("user.home"), "yijia-uploads"));
		} catch (IOException e) {
			throw new IllegalStateException("Failed to prepare local storage directories", e);
		}
	}

}
