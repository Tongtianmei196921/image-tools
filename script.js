document.addEventListener('DOMContentLoaded', () => {
    // 初始化状态管理
    const state = {
        originalImage: null,
        currentImage: null,
        processing: false,
        supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    };

    // 获取DOM元素
    const elements = {
        uploadBox: document.querySelector('.upload-box'),
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

    // 显示错误信息
    function showError(message, duration = 3000) {
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '20px';
        errorDiv.style.left = '50%';
        errorDiv.style.transform = 'translateX(-50%)';
        errorDiv.style.backgroundColor = '#ff4444';
        errorDiv.style.color = 'white';
        errorDiv.style.padding = '10px 20px';
        errorDiv.style.borderRadius = '4px';
        errorDiv.style.zIndex = '1000';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
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

        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    state.originalImage = img;
                    displayImage(img);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } catch (err) {
            showError('图片加载失败');
            console.error(err);
        }
    }

    // 显示图片
    function displayImage(img) {
        const container = elements.uploadBox;
        container.innerHTML = '';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.borderRadius = '4px';
        container.appendChild(img);
    }

    // 事件监听
    elements.uploadBox.addEventListener('click', () => {
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
    elements.uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!state.processing) {
            elements.uploadBox.style.borderColor = var(--primary-color);
            elements.uploadBox.style.backgroundColor = 'rgba(0, 112, 243, 0.02)';
        }
    });

    elements.uploadBox.addEventListener('dragleave', () => {
        elements.uploadBox.style.borderColor = '';
        elements.uploadBox.style.backgroundColor = '';
    });

    elements.uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadBox.style.borderColor = '';
        elements.uploadBox.style.backgroundColor = '';
        if (!state.processing && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    });
});
