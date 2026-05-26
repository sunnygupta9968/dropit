package com.dropit.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FileMetaData implements Serializable {

    private String fileName;

    private String filePath;

    private long fileSize;
}