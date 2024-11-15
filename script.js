document.addEventListener('DOMContentLoaded', () => {
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

    // 显示错误信息
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.color = 'red';
        errorDiv.style.marginTop = '10px';
        errorDiv.textContent = message;
        elements.previewWrapper.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    // 处理文件
    async function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            showError('请选择图片文件');
            return;
        }

        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    elements.previewWrapper.innerHTML = '';
                    elements.previewWrapper.appendChild(img);
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } catch (err) {
            showError('图片加载失败');
            console.error(err);
        }
    }

    // 事件监听
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) handleFile(e.target.files[0]);
    });

    // 拖放处理
    elements.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.uploadArea.style.borderColor = '#0070f3';
    });

    elements.uploadArea.addEventListener('dragleave', () => {
        elements.uploadArea.style.borderColor = '';
    });

    elements.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadArea.style.borderColor = '';
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
});
