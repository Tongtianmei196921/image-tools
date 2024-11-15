document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const elements = {
        uploadArea: document.querySelector('.preview-container'),
        fileInput: document.createElement('input'),
        previewWrapper: document.querySelector('.preview-wrapper'),
        downloadBtn: document.createElement('button'),
        resetBtn: document.createElement('button')
    };

    // 初始化文件输入
    elements.fileInput.type = 'file';
    elements.fileInput.accept = 'image/*';
    elements.fileInput.style.display = 'none';
    document.body.appendChild(elements.fileInput);

    // 状态管理
    const state = {
        originalImage: null,
        currentImage: null,
        processing: false
    };

    // 显示错误信息
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        elements.previewWrapper.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    // 更新预览
    function updatePreview() {
        elements.previewWrapper.innerHTML = '';
        if (state.currentImage) {
            elements.previewWrapper.appendChild(state.currentImage);
        }
    }

    // 文件处理
    async function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            showError('请选择图片文件');
            return;
        }

        try {
            const img = await loadImage(file);
            state.originalImage = img;
            state.currentImage = img;
            updatePreview();
        } catch (err) {
            showError('图片加载失败');
            console.error(err);
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

    // 事件监听
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) handleFile(e.target.files[0]);
    });

    // 拖放处理
    elements.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.add('drag-over');
    });

    elements.uploadArea.addEventListener('dragleave', () => {
        elements.uploadArea.classList.remove('drag-over');
    });

    elements.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.remove('drag-over');
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
});
