package com.dropit.services;

import com.dropit.model.FileMetaData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class FileService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    @Value("${app.file-expiry-minutes:10}")
    private long fileExpiryMinutes;

    public String uploadFile(MultipartFile file) throws IOException {

        String code = generateCode();

        Path uploadPath = Path.of(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        String submittedName = file.getOriginalFilename();
        String originalFilename = submittedName == null || submittedName.isBlank()
                ? "shared-file"
                : Path.of(submittedName).getFileName().toString();
        Path filePath = uploadPath.resolve(code + "_" + originalFilename).normalize();

        File destination = filePath.toFile();

        file.transferTo(destination);

        FileMetaData metadata = new FileMetaData(
                originalFilename,
                filePath.toString(),
                file.getSize()
        );

        redisTemplate.opsForValue().set(
                code,
                metadata,
                fileExpiryMinutes,
                TimeUnit.MINUTES
        );

        return code;
    }
    public FileMetaData getFileMetaData(String code) {

        return (FileMetaData)
                redisTemplate.opsForValue().get(code);
    }

    private String generateCode() {

        return String.valueOf(
                100000 + new Random().nextInt(900000)
        );
    }
}
