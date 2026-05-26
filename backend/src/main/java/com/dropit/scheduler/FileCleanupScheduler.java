package com.dropit.scheduler;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.File;
import java.nio.file.Path;

@Component
public class FileCleanupScheduler {

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    @Value("${app.file-expiry-minutes:10}")
    private long fileExpiryMinutes;

    @Scheduled(fixedRate = 60000)
    public void cleanupOldFiles() {

        File folder = Path.of(uploadDir).toAbsolutePath().normalize().toFile();

        File[] files = folder.listFiles();

        if (files == null) {
            return;
        }

        long currentTime = System.currentTimeMillis();

        for (File file : files) {

            long fileAge =
                    currentTime - file.lastModified();

            long expiryTime =
                    fileExpiryMinutes * 60 * 1000;

            if (fileAge > expiryTime) {

                boolean deleted = file.delete();

                if (deleted) {

                    System.out.println(
                            "Deleted old file: "
                                    + file.getName()
                    );
                }
            }
        }
    }
}
