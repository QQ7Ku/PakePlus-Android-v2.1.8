/**
 * Image Service - Image Processing and Compression
 * Handles: File validation, compression, thumbnail generation
 */

class ImageService {
    // Configuration constants
    static CONFIG = {
        // Allowed MIME types
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
        // Max file size (2MB)
        MAX_FILE_SIZE: 2 * 1024 * 1024,
        // Compression options
        COMPRESSION: {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.8,
            type: 'image/jpeg'
        },
        // Thumbnail options
        THUMBNAIL: {
            maxSize: 200,
            quality: 0.7,
            type: 'image/jpeg'
        },
        // Max images per issue
        MAX_IMAGES: 6
    };

    /**
     * Validate a file object
     * @param {File} file - File to validate
     * @returns {Object} - { valid: boolean, error?: string }
     */
    validateFile(file) {
        // Check type
        if (!ImageService.CONFIG.ALLOWED_TYPES.includes(file.type)) {
            return {
                valid: false,
                error: `不支持的图片格式 "${file.type}"。请使用: JPEG, PNG, WebP`
            };
        }

        // Check size
        if (file.size > ImageService.CONFIG.MAX_FILE_SIZE) {
            return {
                valid: false,
                error: `图片 "${file.name}" 太大 (${this.formatFileSize(file.size)})。最大允许: ${this.formatFileSize(ImageService.CONFIG.MAX_FILE_SIZE)}`
            };
        }

        return { valid: true };
    }

    /**
     * Validate base64 data URL format
     * @param {string} dataUrl - Base64 data URL
     * @returns {Object} - { valid: boolean, mimeType?: string, error?: string }
     */
    validateBase64(dataUrl) {
        if (typeof dataUrl !== 'string') {
            return { valid: false, error: 'Invalid dataUrl type' };
        }

        const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) {
            return { valid: false, error: 'Invalid base64 format' };
        }

        const mimeType = match[1];
        if (!ImageService.CONFIG.ALLOWED_TYPES.includes(mimeType)) {
            return {
                valid: false,
                error: `Unsupported MIME type: ${mimeType}`
            };
        }

        // Check if base64 is valid
        try {
            atob(match[2]);
        } catch (e) {
            return { valid: false, error: 'Invalid base64 data' };
        }

        return { valid: true, mimeType };
    }

    /**
     * Convert File to base64 data URL
     * @param {File} file - File object
     * @returns {Promise<string>} - Base64 data URL
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Compress an image
     * @param {string} dataUrl - Source image data URL
     * @param {Object} options - Compression options
     * @returns {Promise<Object>} - Compressed image data
     */
    async compressImage(dataUrl, options = {}) {
        const config = { ...ImageService.CONFIG.COMPRESSION, ...options };
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                try {
                    // Calculate new dimensions
                    const { width, height } = this.calculateDimensions(
                        img.width,
                        img.height,
                        config.maxWidth,
                        config.maxHeight
                    );

                    // Create canvas
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');

                    // Handle EXIF orientation if needed
                    // (simplified - full implementation would parse EXIF data)
                    
                    // Draw image
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to data URL
                    const compressed = canvas.toDataURL(config.type, config.quality);
                    
                    resolve({
                        dataUrl: compressed,
                        width,
                        height,
                        originalWidth: img.width,
                        originalHeight: img.height,
                        size: this.getBase64Size(compressed)
                    });
                } catch (error) {
                    reject(error);
                }
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = dataUrl;
        });
    }

    /**
     * Create thumbnail from image
     * @param {string} dataUrl - Source image data URL
     * @param {number} maxSize - Max thumbnail dimension
     * @returns {Promise<string>} - Thumbnail data URL
     */
    async createThumbnail(dataUrl, maxSize = ImageService.CONFIG.THUMBNAIL.maxSize) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                try {
                    // Calculate thumbnail dimensions (square crop, center)
                    let sourceX = 0, sourceY = 0;
                    let sourceWidth = img.width;
                    let sourceHeight = img.height;
                    
                    // Crop to square if needed
                    if (img.width !== img.height) {
                        const minDim = Math.min(img.width, img.height);
                        sourceX = (img.width - minDim) / 2;
                        sourceY = (img.height - minDim) / 2;
                        sourceWidth = minDim;
                        sourceHeight = minDim;
                    }

                    // Create canvas
                    const canvas = document.createElement('canvas');
                    canvas.width = maxSize;
                    canvas.height = maxSize;
                    const ctx = canvas.getContext('2d');

                    // Draw cropped image
                    ctx.drawImage(
                        img,
                        sourceX, sourceY, sourceWidth, sourceHeight,
                        0, 0, maxSize, maxSize
                    );

                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                } catch (error) {
                    reject(error);
                }
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = dataUrl;
        });
    }

    /**
     * Process a file (validate, convert, compress, create thumbnail)
     * @param {File} file - File to process
     * @returns {Promise<Object>} - Processed image data
     */
    async processFile(file) {
        // Validate
        const validation = this.validateFile(file);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        // Convert to base64
        const dataUrl = await this.fileToBase64(file);

        // Compress
        const compressed = await this.compressImage(dataUrl);

        // Create thumbnail
        const thumbnail = await this.createThumbnail(compressed.dataUrl);

        return {
            id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type: file.type,
            size: compressed.size,
            originalSize: file.size,
            width: compressed.width,
            height: compressed.height,
            dataUrl: compressed.dataUrl,
            thumbnail,
            createdAt: new Date().toISOString()
        };
    }

    /**
     * Process multiple files
     * @param {FileList} files - Files to process
     * @param {number} maxCount - Maximum allowed images
     * @returns {Promise<Array>} - Array of processed image data
     */
    async processFiles(files, maxCount = ImageService.CONFIG.MAX_IMAGES) {
        const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        
        if (validFiles.length === 0) {
            throw new Error('未找到有效的图片文件');
        }

        if (validFiles.length > maxCount) {
            throw new Error(`最多允许上传 ${maxCount} 张图片`);
        }

        const results = [];
        for (const file of validFiles) {
            try {
                const processed = await this.processFile(file);
                results.push(processed);
            } catch (error) {
                console.warn(`Failed to process file ${file.name}:`, error);
                // Continue with other files
            }
        }

        return results;
    }

    /**
     * Calculate new dimensions maintaining aspect ratio
     * @param {number} width - Original width
     * @param {number} height - Original height
     * @param {number} maxWidth - Max width
     * @param {number} maxHeight - Max height
     * @returns {Object} - { width, height }
     */
    calculateDimensions(width, height, maxWidth, maxHeight) {
        let newWidth = width;
        let newHeight = height;

        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            newWidth = Math.round(width * ratio);
            newHeight = Math.round(height * ratio);
        }

        return { width: newWidth, height: newHeight };
    }

    /**
     * Get base64 data size in bytes
     * @param {string} dataUrl - Base64 data URL
     * @returns {number} - Size in bytes
     */
    getBase64Size(dataUrl) {
        const base64 = dataUrl.split(',')[1] || dataUrl;
        const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
        return (base64.length * 3 / 4) - padding;
    }

    /**
     * Convert base64 to Blob
     * @param {string} dataUrl - Base64 data URL
     * @returns {Blob} - Blob object
     */
    dataUrlToBlob(dataUrl) {
        const byteString = atob(dataUrl.split(',')[1]);
        const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        
        return new Blob([ab], { type: mimeString });
    }

    /**
     * Format file size for display
     * @param {number} bytes - Size in bytes
     * @returns {string} - Formatted size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ImageService };
} else {
    window.ImageService = ImageService;
}
