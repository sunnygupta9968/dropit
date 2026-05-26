package com.dropit.controller;

import com.dropit.model.FileMetaData;
import com.dropit.services.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@CrossOrigin("*")
public class FileController {

    @Autowired
    private FileService fileService;

    @PostMapping("/upload")
    public Map<String, String> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        String code = fileService.uploadFile(file);

        return Map.of(
                "code",
                code
        );
    }

    @GetMapping("/download/{code}")
    public ResponseEntity<InputStreamResource> downloadFile(
            @PathVariable String code
    ) throws Exception {

        FileMetaData metadata = fileService.getFileMetaData(code);
        if (metadata == null) {
            return ResponseEntity.notFound().build();
        }
        File file = new File(metadata.getFilePath());
        InputStreamResource resource = new InputStreamResource(new FileInputStream(file));
        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" +
                                metadata.getFileName() +
                                "\""
                )
                .contentLength(file.length())
                .contentType(
                        MediaType.APPLICATION_OCTET_STREAM
                )
                .body(resource);
    }
}
