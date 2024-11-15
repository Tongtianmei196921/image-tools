document.addEventListener('DOMContentLoaded', () => {
    // 初始化状态
    const state = {
        originalImage: null,
        processing: false,
        supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    };

    // 获取DOM元素
    const uploadBox = document.getElementById('uploadBox');
    const fileInput = createFileInput();

    // 创建隐藏的文件输入
    function createFileInput() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        document.body.appendChild(input);
        return input;
    }

    // 显示错误消息
    function showError(message, duration = 3000) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #ff4444;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            z-index: 1000;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => {
            errorDiv.style.opacity = '0';
            errorDiv.style.transition = 'opacity 0.3s ease';
            setTimeout(() => errorDiv.remove(), 300);
        }, duration);
    }

    // 处理文件上传
    async function handleFile(file) {
        if (!file) return;

        // 检查文件类型
        if (!state.supportedFormats.includes(file.type)) {
            showError('不支持的文件格式，请使用 JPG、PNG、WebP 或 GIF 格式的图片');
            return;
        }

        // 检查文件大小 (10MB)
        if (file.size > 10 * 1024 * 1024) {
            showError('文件太大，请使用小于 10MB 的图片');
            return;
        }

        state.processing = true;
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    state.originalImage = img;
                    displayImage(img);
                    state.processing = false;
                };
                img.onerror = () => {
                    showError('图片加载失败，请重试');
                    state.processing = false;
                };
                img.src = e.target.result;
            };
            reader.onerror = () => {
                showError('文件读取失败，请重试');
                state.processing = false;
            };
            reader.readAsDataURL(file);
        } catch (err) {
            showError('处理图片时出错，请重试');
            state.processing = false;
            console.error(err);
        }
    }

    // 显示图片
    function displayImage(img) {
        uploadBox.innerHTML = '';
        img.style.cssText = `
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        `;
        uploadBox.appendChild(img);
    }

    // 事件监听：点击上传
    uploadBox.addEventListener('click', () => {
        if (!state.processing) {
            fileInput.click();
        }
    });

    // 事件监听：文件选择
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    });

    // 事件监听：拖放
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!state.processing) {
            uploadBox.style.borderColor = '#0070f3';
            uploadBox.style.backgroundColor = 'rgba(0, 112, 243, 0.02)';
        }
    });

    uploadBox.addEventListener('dragleave', () => {
        uploadBox.style.borderColor = '';
        uploadBox.style.backgroundColor = '';
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '';
        uploadBox.style.backgroundColor = '';
        if (!state.processing && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    });
});
