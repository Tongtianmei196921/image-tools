document.addEventListener('DOMContentLoaded', () => {
    // 初始化状态
    const state = {
        originalImage: null,
        currentImage: null,
        processing: false,
        supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        currentRotation: 0,
        isFlipped: false,
        brightness: 100,
        contrast: 100
    };

    // 获取DOM元素
    const elements = {
        uploadBox: document.getElementById('uploadBox'),
        editTools: document.querySelector('.edit-tools'),
        adjustmentControls: document.querySelector('.adjustment-controls'),
        slider: document.getElementById('adjustmentSlider'),
        applyBtn: document.querySelector('.apply-btn'),
        cancelBtn: document.querySelector('.cancel-btn'),
        fileInput: createFileInput()
    };

    // 创建文件输入
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

        if (!state.supportedFormats.includes(file.type)) {
            showError('不支持的文件格式，请使用 JPG、PNG、WebP 或 GIF 格式的图片');
            return;
        }

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
                    state.currentImage = img;
                    displayImage(img);
                    elements.editTools.style.display = 'block';
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
        elements.uploadBox.innerHTML = '';
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 设置画布大小
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 应用当前的变换
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(state.currentRotation * Math.PI/180);
        if (state.isFlipped) ctx.scale(-1, 1);
        ctx.translate(-canvas.width/2, -canvas.height/2);
        
        // 绘制图片
        ctx.drawImage(img, 0, 0);
        
        // 应用滤镜
        if (state.brightness !== 100 || state.contrast !== 100) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            applyFilters(imageData.data);
            ctx.putImageData(imageData, 0, 0);
        }
        
        canvas.style.maxWidth = '100%';
        canvas.style.height = 'auto';
        elements.uploadBox.appendChild(canvas);
    }

    // 应用滤镜
    function applyFilters(pixels) {
        const brightness = state.brightness / 100;
        const contrast = state.contrast / 100;
        
        for (let i = 0; i < pixels.length; i += 4) {
            pixels[i] = pixels[i] * brightness * contrast;
            pixels[i + 1] = pixels[i + 1] * brightness * contrast;
            pixels[i + 2] = pixels[i + 2] * brightness * contrast;
        }
    }

    // 工具按钮点击处理
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tool = btn.dataset.tool;
            switch(tool) {
                case 'rotate':
                    state.currentRotation = (state.currentRotation + 90) % 360;
                    displayImage(state.currentImage);
                    break;
                case 'flip':
                    state.isFlipped = !state.isFlipped;
                    displayImage(state.currentImage);
                    break;
                case 'brightness':
                case 'contrast':
                    showAdjustmentControls(tool);
                    break;
                case 'save':
                    saveImage();
                    break;
            }
        });
    });

    // 显示调整控制器
    function showAdjustmentControls(tool) {
        elements.adjustmentControls.style.display = 'flex';
        elements.slider.value = state[tool];
        
        elements.applyBtn.onclick = () => {
            state[tool] = parseInt(elements.slider.value);
            displayImage(state.currentImage);
            elements.adjustmentControls.style.display = 'none';
        };
        
        elements.cancelBtn.onclick = () => {
            elements.adjustmentControls.style.display = 'none';
        };
    }

    // 保存图片
    function saveImage() {
        const canvas = elements.uploadBox.querySelector('canvas');
        const link = document.createElement('a');
        link.download = 'edited-image.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    // 事件监听：点击上传
    elements.uploadBox.addEventListener('click', () => {
        if (!state.processing) {
            elements.fileInput.click();
        }
    });

    // 事件监听：文件选择
    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    });

    // 事件监听：拖放
    elements.uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!state.processing) {
            elements.uploadBox.style.borderColor = '#0070f3';
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
