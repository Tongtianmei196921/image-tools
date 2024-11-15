document.addEventListener('DOMContentLoaded', () => {
    // 初始化状态管理
    const state = {
        originalImage: null,
        currentImage: null,
        processing: false,
        supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/tiff']
    };

    // 获取DOM元素
    const elements = {
        uploadArea: document.querySelector('.preview-container'),
        previewWrapper: document.querySelector('.preview-wrapper'),
        fileInput: createFileInput()
    };

    // 创建文件输入元素
    function createFileInput() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        document.body.appendChild(input);
        return input;
    }

    // 显示上传提示
    function showUploadTip() {
        elements.previewWrapper.innerHTML = `
            <div class="upload-tip">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p>点击或拖放图片到此处</p>
                <p class="upload-tip-sub">支持 JPG、PNG、WebP、GIF、TIFF 格式</p>
            </div>
        `;
    }

    // 显示错误信息
    function showError(message, duration = 3000) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        elements.previewWrapper.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), duration);
    }

    // 处理文件
    async function handleFile(file) {
        if (!file) return;
        
        if (!state.supportedFormats.includes(file.type)) {
            showError('不支持的文件格式');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            showError('文件大小不能超过10MB');
            return;
        }

        state.processing = true;
        try {
            const img = await loadImage(file);
            state.originalImage = img;
            state.currentImage = img.cloneNode();
            updatePreview();
        } catch (err) {
            showError('图片加载失败');
            console.error(err);
        } finally {
            state.processing = false;
        }
    }

    // 加载图片
    function loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // 更新预览
    function updatePreview() {
        elements.previewWrapper.innerHTML = '';
        if (state.currentImage) {
            elements.previewWrapper.appendChild(state.currentImage);
        } else {
            showUploadTip();
        }
    }

    // 事件监听
    elements.uploadArea.addEventListener('click', () => {
        if (!state.processing) {
            elements.fileInput.click();
        }
    });

    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    });

    // 拖放处理
    elements.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!state.processing) {
            elements.uploadArea.classList.add('drag-over');
        }
    });

    elements.uploadArea.addEventListener('dragleave', () => {
        elements.uploadArea.classList.remove('drag-over');
    });

    elements.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.remove('drag-over');
        if (!state.processing && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // 初始化显示
    showUploadTip();
});
